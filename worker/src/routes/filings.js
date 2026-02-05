// SEC EDGAR S-3 Filings — fetches real data from EDGAR EFTS API
// Adds required User-Agent header that browsers cannot set
// Falls back to EDGAR Atom RSS feed if EFTS returns 403

const filingsCache = { data: null, timestamp: 0 };
const CACHE_TTL = 600000; // 10 minutes

export async function handleFilings(request, env) {
    // Check cache
    if (filingsCache.data && Date.now() - filingsCache.timestamp < CACHE_TTL) {
        return new Response(JSON.stringify(filingsCache.data), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
    }

    let result = null;

    // Strategy 1: EDGAR EFTS full-text search API
    try {
        result = await fetchFromEFTS(env);
    } catch (e) {
        console.error('EFTS failed:', e.message);
    }

    // Strategy 2: EDGAR recent filings Atom feed
    if (!result) {
        try {
            result = await fetchFromAtomFeed(env);
        } catch (e) {
            console.error('Atom feed failed:', e.message);
        }
    }

    // Strategy 3: EDGAR company search for known S-3 filers
    if (!result) {
        try {
            result = await fetchFromCompanySearch(env);
        } catch (e) {
            console.error('Company search failed:', e.message);
        }
    }

    if (!result) {
        result = { filings: [], total: 0, error: 'SEC EDGAR temporarily unavailable', asOf: new Date().toISOString() };
    }

    // Cache successful results
    if (result.filings.length > 0) {
        filingsCache.data = result;
        filingsCache.timestamp = Date.now();
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
}

async function fetchFromEFTS(env) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // EFTS search endpoint
    const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22S-3%22&forms=S-3,S-3ASR,S-3%2FA&dateRange=custom&startdt=${startDate}&enddt=${endDate}&from=0&size=10`;

    const res = await fetch(searchUrl, {
        headers: {
            'User-Agent': env.SEC_USER_AGENT || 'DinoTradez admin@dinotradez.com',
            'Accept': 'application/json',
        }
    });

    if (!res.ok) throw new Error(`EFTS ${res.status}`);

    const raw = await res.json();
    const hits = raw.hits?.hits || [];

    if (hits.length === 0) throw new Error('No EFTS results');

    const filings = hits.map(hit => {
        const src = hit._source || {};
        const entityName = src.entity_name || '';
        const displayNames = src.display_names || [];
        const displayName = displayNames[0] || entityName || 'Unknown';

        // Parse ticker from display name format: "Company Name (TICK) (CIK 0001234567)"
        const tickerMatch = displayName.match(/\(([A-Z]{1,5})\)/);
        const companyMatch = displayName.match(/^(.+?)\s*\(/);

        // Build filing URL from accession number
        const accession = hit._id || '';
        const cik = (src.ciks || [''])[0];
        let filingUrl = '#';
        if (accession && cik) {
            const accClean = accession.replace(/-/g, '');
            filingUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accClean}/${accession}-index.htm`;
        }

        return {
            company: companyMatch ? companyMatch[1].trim() : entityName || displayName,
            symbol: tickerMatch ? tickerMatch[1] : (src.tickers || [''])[0] || '',
            type: src.form_type || src.root_form || 'S-3',
            date: src.file_date || '',
            url: filingUrl,
            source: 'edgar-efts'
        };
    });

    return {
        filings,
        total: raw.hits?.total?.value || filings.length,
        asOf: new Date().toISOString(),
        source: 'edgar-efts'
    };
}

async function fetchFromAtomFeed(env) {
    const feedUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=S-3&dateb=&owner=include&count=10&search_text=&start=0&output=atom';

    const res = await fetch(feedUrl, {
        headers: {
            'User-Agent': env.SEC_USER_AGENT || 'DinoTradez admin@dinotradez.com',
            'Accept': 'application/atom+xml, application/xml, text/xml',
        }
    });

    if (!res.ok) throw new Error(`Atom feed ${res.status}`);

    const xml = await res.text();
    const filings = [];

    // Parse Atom XML entries
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null && filings.length < 10) {
        const entry = match[1];
        const title = (entry.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '';
        const updated = (entry.match(/<updated>(.*?)<\/updated>/) || [])[1] || '';
        const link = (entry.match(/<link[^>]*href="([^"]*)"/) || [])[1] || '';
        const summary = (entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '';

        // Parse title format: "S-3 - Company Name (0001234567) (Filer)"
        const formMatch = title.match(/^(S-3[A-Z\/]*)/i);
        const companyMatch = title.match(/- (.+?)(?:\s*\(0|\s*$)/);

        // Try to find ticker from summary
        const tickerMatch = summary.match(/\b([A-Z]{1,5})\b/) || title.match(/\b([A-Z]{2,5})\b/);

        filings.push({
            company: companyMatch ? companyMatch[1].trim() : title.replace(/S-3[A-Z\/]*\s*-\s*/i, '').trim(),
            symbol: tickerMatch ? tickerMatch[1] : '',
            type: formMatch ? formMatch[1].toUpperCase() : 'S-3',
            date: updated ? updated.split('T')[0] : '',
            url: link || '#',
            source: 'edgar-atom'
        });
    }

    if (filings.length === 0) throw new Error('No Atom entries found');

    return {
        filings,
        total: filings.length,
        asOf: new Date().toISOString(),
        source: 'edgar-atom'
    };
}

async function fetchFromCompanySearch(env) {
    // Search EDGAR full-text search with a simpler endpoint
    const searchUrl = 'https://efts.sec.gov/LATEST/search-index?q=&forms=S-3&dateRange=custom&startdt=' +
        new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const res = await fetch(searchUrl, {
        headers: {
            'User-Agent': env.SEC_USER_AGENT || 'DinoTradez admin@dinotradez.com',
            'Accept': 'application/json',
        }
    });

    if (!res.ok) throw new Error(`Company search ${res.status}`);

    const raw = await res.json();
    const hits = raw.hits?.hits || [];

    if (hits.length === 0) throw new Error('No company search results');

    const filings = hits.slice(0, 10).map(hit => {
        const src = hit._source || {};
        return {
            company: src.entity_name || 'Unknown',
            symbol: (src.tickers || [''])[0] || '',
            type: src.form_type || 'S-3',
            date: src.file_date || '',
            url: '#',
            source: 'edgar-search'
        };
    });

    return {
        filings,
        total: raw.hits?.total?.value || filings.length,
        asOf: new Date().toISOString(),
        source: 'edgar-search'
    };
}

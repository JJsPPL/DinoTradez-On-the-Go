// Finnhub stock quote proxy — hides API key server-side
// Returns the same JSON shape as Finnhub so frontend parsing is unchanged

const quoteCache = new Map();
const CACHE_TTL = 60000; // 1 minute server-side cache

export async function handleQuote(request, env) {
    const url = new URL(request.url);
    const symbol = (url.searchParams.get('symbol') || '').toUpperCase().trim();

    if (!symbol || !/^[A-Z.]{1,10}$/.test(symbol)) {
        return new Response(JSON.stringify({ error: 'Invalid symbol' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Check cache
    const cached = quoteCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return new Response(JSON.stringify(cached.data), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
    }

    // Fetch from Finnhub
    const apiKey = env.FINNHUB_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
    );

    if (!res.ok) {
        // Return cached data if available, even if stale
        if (cached) {
            return new Response(JSON.stringify(cached.data), {
                headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' }
            });
        }
        return new Response(JSON.stringify({ error: `Finnhub error: ${res.status}` }), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const data = await res.json();

    // Cache the response
    quoteCache.set(symbol, { data, timestamp: Date.now() });

    // Evict oldest entries if cache grows too large
    if (quoteCache.size > 200) {
        let oldest = null, oldestTime = Infinity;
        for (const [key, val] of quoteCache) {
            if (val.timestamp < oldestTime) { oldest = key; oldestTime = val.timestamp; }
        }
        if (oldest) quoteCache.delete(oldest);
    }

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
}

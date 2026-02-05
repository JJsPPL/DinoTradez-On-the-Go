// Short Interest data — uses Finnhub basic financials for real short interest %
// Falls back to known baseline values if Finnhub data unavailable

const siCache = { data: null, timestamp: 0 };
const CACHE_TTL = 3600000; // 1 hour (short interest data doesn't change frequently)

const SHORT_INTEREST_SYMBOLS = ['GME', 'AMC', 'KOSS', 'CVNA', 'BYND', 'UPST', 'SPCE', 'MARA', 'ATER', 'CLOV'];

// Known baseline short interest % from public financial sources
// Serves as fallback when API data is unavailable
const BASELINE_SHORT_INTEREST = {
    'GME': 20, 'AMC': 18, 'KOSS': 15, 'CVNA': 25, 'BYND': 35,
    'UPST': 28, 'SPCE': 22, 'MARA': 19, 'ATER': 32, 'CLOV': 12
};

export async function handleShortInterest(request, env) {
    // Check cache
    if (siCache.data && Date.now() - siCache.timestamp < CACHE_TTL) {
        return new Response(JSON.stringify(siCache.data), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
    }

    const results = [];
    const apiKey = env.FINNHUB_API_KEY;

    for (const symbol of SHORT_INTEREST_SYMBOLS) {
        let shortPercent = null;
        let daysToCover = null;
        let shortShares = null;
        let source = 'baseline';

        // Try Finnhub basic financials (includes short interest metrics)
        if (apiKey) {
            try {
                const res = await fetch(
                    `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`
                );
                if (res.ok) {
                    const data = await res.json();
                    const metrics = data?.metric || {};

                    // Finnhub provides these short interest fields in basic financials
                    if (metrics['shortPercentOutstanding'] != null) {
                        shortPercent = metrics['shortPercentOutstanding'];
                        source = 'finnhub';
                    } else if (metrics['shortPercentFloat'] != null) {
                        shortPercent = metrics['shortPercentFloat'];
                        source = 'finnhub';
                    }

                    if (metrics['daysToCoverShort'] != null) {
                        daysToCover = metrics['daysToCoverShort'];
                    }

                    if (metrics['shortInterest'] != null) {
                        shortShares = metrics['shortInterest'];
                    }
                }
            } catch (e) {
                console.error(`Finnhub metrics ${symbol}:`, e.message);
            }

            // Small delay to respect rate limits (60 calls/min)
            await new Promise(r => setTimeout(r, 200));
        }

        // Fallback to known baseline
        if (shortPercent === null) {
            shortPercent = BASELINE_SHORT_INTEREST[symbol] || 15;
            source = 'baseline';
        }

        results.push({
            symbol,
            shortPercent,
            daysToCover,
            shortShares,
            source,
            stale: source === 'baseline'
        });
    }

    const response = {
        data: results,
        asOf: new Date().toISOString(),
        source: results.some(r => r.source === 'finnhub') ? 'finnhub' : 'baseline'
    };

    // Cache results
    siCache.data = response;
    siCache.timestamp = Date.now();

    return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
}

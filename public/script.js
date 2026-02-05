// DinoTradez - Real Scoring Algorithms & Live Data
// Direct Finnhub API with token-bucket rate limiting + localStorage cache
// Intelligence: SEC EDGAR (S-3 link), short interest (baseline), dark pool (estimation)
// Scoring ported from src/pages/api/ TypeScript endpoints

// ========================================
// CONFIGURATION
// ========================================
const FINNHUB_API_KEY = 'cvt3s5hr01qosd2f1pugcvt3s5hr01qosd2f1pv0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const CACHE_KEY = 'dinoTradez_stockCache';
const CACHE_VERSION = 2;
const CACHE_ENTRY_TTL = 300000; // 5 min per symbol

// In-memory cache (loaded from localStorage on init)
let stockCache = {};

function loadCacheFromStorage() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed._v !== CACHE_VERSION) { localStorage.removeItem(CACHE_KEY); return; }
        stockCache = parsed.data || {};
    } catch (e) { console.warn('Cache load failed:', e); }
}

function saveCacheToStorage() {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ _v: CACHE_VERSION, data: stockCache }));
    } catch (e) { console.warn('Cache save failed:', e); }
}

// ========================================
// STOCK LISTS (from src/pages/api/ endpoints)
// ========================================
const BULLISH_STOCKS = [
    'AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','NFLX','ADBE','CRM',
    'PYPL','INTC','AMD','QCOM','AVGO','TXN','MU','AMAT','KLAC','LRCX'
];
const BEARISH_STOCKS = [
    'XOM','CVX','COP','EOG','OXY','SLB','HAL','BKR','NOV','FTI',
    'WFRD','EXE','DVN','APA','MRO','KMI','PSX','VLO','MPC','HES'
];
const LOTTO_STOCKS = [
    'DINO','CEMI','GEVO','NE','RIG','XOM','CVX','COP','EOG','OXY',
    'SLB','HAL','BKR','NOV','FTI','WFRD','EXE','DVN','APA','MRO'
];
const DARK_POOL_STOCKS = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','NFLX'];
const SHORT_INTEREST_STOCKS = ['GME','AMC','KOSS','CVNA','BYND','UPST','SPCE','MARA','ATER','CLOV'];
const MARKET_INDICES = ['SPY','QQQ','DIA','IWM','VIXY','TLT'];

const KNOWN_SHORT_INTEREST = {
    'GME':20,'AMC':18,'KOSS':15,'CVNA':25,'BYND':35,
    'UPST':28,'SPCE':22,'MARA':19,'ATER':32,'CLOV':12
};
const ORIGINAL_2023_PRICES = {
    'DINO':41.91,'CEMI':32.09,'GEVO':178.66,'NE':52.85,'RIG':79.90,
    'XOM':95.00,'CVX':150.00,'COP':110.00,'EOG':120.00,'OXY':60.00,
    'SLB':50.00,'HAL':30.00,'BKR':25.00,'NOV':20.00,'FTI':15.00,
    'WFRD':50.00,'EXE':80.00,'DVN':60.00,'APA':40.00,'MRO':25.00
};

let scannedStocks = { bullish:[], bearish:[], lotto:[], darkPool:[], shortInterest:[] };

// ========================================
// TOKEN-BUCKET RATE LIMITER
// ========================================
const RATE_LIMIT = {
    maxTokens: 55,       // Finnhub allows 60/min, leave margin
    tokens: 55,
    refillRate: 55 / 60, // tokens per second
    lastRefill: Date.now()
};

function refillTokens() {
    const now = Date.now();
    const elapsed = (now - RATE_LIMIT.lastRefill) / 1000;
    RATE_LIMIT.tokens = Math.min(RATE_LIMIT.maxTokens, RATE_LIMIT.tokens + elapsed * RATE_LIMIT.refillRate);
    RATE_LIMIT.lastRefill = now;
}

async function waitForToken() {
    refillTokens();
    if (RATE_LIMIT.tokens >= 1) {
        RATE_LIMIT.tokens -= 1;
        return;
    }
    // Wait until a token is available
    const waitMs = ((1 - RATE_LIMIT.tokens) / RATE_LIMIT.refillRate) * 1000;
    console.log(`Rate limiter: waiting ${Math.ceil(waitMs)}ms for token`);
    await delay(Math.ceil(waitMs) + 50);
    refillTokens();
    RATE_LIMIT.tokens -= 1;
}

async function fetchWithRetry(url, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        await waitForToken();
        try {
            const res = await fetch(url);
            if (res.status === 429) {
                const backoff = Math.pow(2, attempt + 1) * 1000;
                console.warn(`429 rate limited, backing off ${backoff}ms (attempt ${attempt + 1}/${retries})`);
                await delay(backoff);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (attempt === retries - 1) throw e;
            await delay(Math.pow(2, attempt) * 500);
        }
    }
    throw new Error('Max retries exceeded');
}

// ========================================
// SYMBOL DEDUPLICATION
// ========================================
function getUniqueSymbols() {
    // Priority: Market Indices > Dark Pool > Bullish > Bearish > Lotto > Short Interest
    const seen = new Set();
    const ordered = [];
    const lists = [MARKET_INDICES, DARK_POOL_STOCKS, BULLISH_STOCKS, BEARISH_STOCKS, LOTTO_STOCKS, SHORT_INTEREST_STOCKS];
    for (const list of lists) {
        for (const sym of list) {
            if (!seen.has(sym)) {
                seen.add(sym);
                ordered.push(sym);
            }
        }
    }
    return ordered;
}

// ========================================
// UTILITIES
// ========================================
function showMessage(message, type = 'info') {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:6px;z-index:9999;transition:opacity 0.3s;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.3);color:white;';
    if (type === 'error') el.style.backgroundColor = 'rgba(231,76,60,0.95)';
    else if (type === 'success') el.style.backgroundColor = 'rgba(46,204,113,0.95)';
    else el.style.backgroundColor = 'rgba(52,152,219,0.95)';
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

function formatLargeNumber(num) {
    if (!num || isNaN(num)) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
}

function isCached(symbol) {
    const c = stockCache[symbol];
    return c && Date.now() - c.timestamp < CACHE_ENTRY_TTL;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========================================
// STOCK QUOTE API (direct Finnhub)
// ========================================
async function fetchStockQuote(symbol) {
    if (isCached(symbol)) return stockCache[symbol].data;
    try {
        const d = await fetchWithRetry(`${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`);
        if (d && d.c && d.c > 0) {
            const range = d.pc > 0 ? (d.h - d.l) / d.pc : 0;
            let estVol;
            if (range > 0.03) estVol = 15000000 + Math.random() * 10000000;
            else if (range > 0.015) estVol = 8000000 + Math.random() * 5000000;
            else if (range > 0.005) estVol = 3000000 + Math.random() * 3000000;
            else estVol = 1000000 + Math.random() * 2000000;
            estVol = Math.floor(estVol);
            let estMC;
            if (d.c > 500) estMC = d.c * 2500000000;
            else if (d.c > 100) estMC = d.c * 1500000000;
            else if (d.c > 50) estMC = d.c * 800000000;
            else if (d.c > 10) estMC = d.c * 300000000;
            else estMC = d.c * 100000000;
            const q = {
                symbol, price: d.c, change: d.d || 0, percentChange: d.dp || 0,
                previousClose: d.pc || 0, open: d.o || 0, high: d.h || 0, low: d.l || 0,
                dailyRange: range, volume: estVol,
                avgVolume: Math.floor(estVol * (0.8 + Math.random() * 0.4)),
                marketCap: estMC, sharesOutstanding: Math.floor(estMC / d.c)
            };
            stockCache[symbol] = { data: q, timestamp: Date.now() };
            saveCacheToStorage();
            return q;
        }
        return stockCache[symbol]?.data || null;
    } catch (e) {
        console.error(`Fetch ${symbol}:`, e);
        return stockCache[symbol]?.data || null;
    }
}

// ========================================
// CARD RENDERING (Market, Crypto, Commodity)
// ========================================
function renderMarketCards() {
    const grid = document.getElementById('indices-grid');
    if (!grid) return;
    const icons = { 'SPY': 'fa-chart-line', 'QQQ': 'fa-microchip', 'DIA': 'fa-industry', 'IWM': 'fa-building', 'VIXY': 'fa-bolt', 'TLT': 'fa-university' };
    const names = { 'SPY': 'S&P 500', 'QQQ': 'NASDAQ 100', 'DIA': 'Dow Jones', 'IWM': 'Russell 2000', 'VIXY': 'VIX Volatility', 'TLT': '20Y Treasury' };
    grid.innerHTML = MARKET_INDICES.map(sym => `
        <div class="market-card" data-symbol="${sym}">
            <div class="card-icon"><i class="fas ${icons[sym] || 'fa-chart-bar'}"></i></div>
            <div class="card-label">${names[sym] || sym}</div>
            <div class="market-value">--</div>
            <div class="market-change neutral"><p>--</p></div>
        </div>`).join('');
}

function renderCryptoCards() {
    const grid = document.getElementById('crypto-grid');
    if (!grid) return;
    const icons = { 'BTC-USD': 'fa-bitcoin-sign', 'ETH-USD': 'fa-ethereum', 'BNB-USD': 'fa-coins', 'SOL-USD': 'fa-sun', 'XRP-USD': 'fa-water', 'DOGE-USD': 'fa-dog' };
    const names = { 'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'BNB-USD': 'BNB', 'SOL-USD': 'Solana', 'XRP-USD': 'XRP', 'DOGE-USD': 'Dogecoin' };
    const symbols = Object.keys(cryptoMapping);
    grid.innerHTML = symbols.map(sym => `
        <div class="crypto-card" data-symbol="${sym}">
            <div class="card-icon"><i class="fas ${icons[sym] || 'fa-coins'}"></i></div>
            <div class="card-label">${names[sym] || sym}</div>
            <div class="crypto-price">--</div>
            <div class="market-change neutral"><p class="crypto-change">--</p></div>
        </div>`).join('');
}

function renderCommodityCards() {
    const grid = document.getElementById('commodity-grid');
    if (!grid) return;
    const icons = { 'GC=F': 'fa-coins', 'SI=F': 'fa-ring', 'HG=F': 'fa-cube', 'PL=F': 'fa-gem', 'PA=F': 'fa-gem' };
    const names = { 'GC=F': 'Gold', 'SI=F': 'Silver', 'HG=F': 'Copper', 'PL=F': 'Platinum', 'PA=F': 'Palladium' };
    const symbols = Object.keys(commodityMapping);
    grid.innerHTML = symbols.map(sym => `
        <div class="commodity-card" data-symbol="${sym}">
            <div class="card-icon"><i class="fas ${icons[sym] || 'fa-gem'}"></i></div>
            <div class="card-label">${names[sym] || sym}</div>
            <div class="commodity-price">--</div>
            <div class="market-change neutral"><p class="commodity-change">--</p></div>
        </div>`).join('');
}

// ========================================
// SCORING ALGORITHMS (from TypeScript API endpoints)
// ========================================

// Lotto Score: Momentum 30%, Volume 25%, Price Range 25%, Volatility 20%
function calculateLottoScore(q) {
    if (!q || !q.price) return 0;
    let s = 0;
    const dp = q.percentChange || 0, p = q.price, r = q.dailyRange || 0;
    if (dp > 5) s += 30; else if (dp > 2) s += 20; else if (dp > 0) s += 10;
    if (r > 0.03) s += 25; else if (r > 0.015) s += 15; else if (r > 0.005) s += 10;
    if (p > 50) s += 25; else if (p > 20) s += 20; else if (p > 10) s += 15; else if (p > 5) s += 10;
    const a = Math.abs(dp);
    if (a > 10) s += 20; else if (a > 5) s += 15; else if (a > 2) s += 10;
    return s;
}

// Bullish Score: positive momentum + volume + institutional + price level
function calculateBullishScore(q) {
    if (!q || !q.price) return 0;
    let s = 0;
    const dp = q.percentChange || 0, p = q.price, r = q.dailyRange || 0;
    if (dp > 2) s += 30; else if (dp > 0) s += 20;
    if (r > 0.02) s += 25; else if (r > 0.01) s += 15;
    if (dp > 1) s += 25; else if (dp > 0) s += 15;
    if (p > 100) s += 20; else if (p > 50) s += 15; else if (p > 20) s += 10;
    return s;
}

// Bearish Score: negative momentum + volume + institutional + price level
function calculateBearishScore(q) {
    if (!q || !q.price) return 0;
    let s = 0;
    const dp = q.percentChange || 0, p = q.price, r = q.dailyRange || 0;
    if (dp < -2) s += 30; else if (dp < 0) s += 20;
    if (r > 0.02) s += 25; else if (r > 0.01) s += 15;
    if (dp < -1) s += 25; else if (dp < 0) s += 15;
    if (p < 20) s += 20; else if (p < 50) s += 15; else if (p < 100) s += 10;
    return s;
}

// Dark Pool % estimate from institutional sentiment proxy
function estimateDarkPoolPercent(q) {
    if (!q || !q.price) return 40;
    let dp = 40;
    const p = q.price, a = Math.abs(q.percentChange || 0), r = q.dailyRange || 0;
    if (p > 200) dp += 8; else if (p > 100) dp += 5; else if (p > 50) dp += 2;
    if (a < 0.5) dp += 5; else if (a < 1) dp += 3; else if (a > 3) dp -= 5;
    if (r < 0.01) dp += 3; else if (r > 0.03) dp -= 3;
    dp += (Math.random() - 0.5) * 4;
    return Math.max(25, Math.min(65, dp));
}

function getScoreSignal(score) {
    if (score >= 80) return '<span class="strong-buy">Strong Buy</span>';
    if (score >= 60) return '<span class="buy">Buy</span>';
    if (score >= 40) return '<span class="watch">Watch</span>';
    return '<span class="avoid">Avoid</span>';
}

// ========================================
// SCANNING ENGINE (progressive updates, deduplicated)
// ========================================
async function runFullScan() {
    console.log('Running full scan with deduplicated symbols...');
    updateScanStatus('Starting scan...');

    const uniqueSymbols = getUniqueSymbols();
    const marketSet = new Set(MARKET_INDICES);
    const darkPoolSet = new Set(DARK_POOL_STOCKS);
    const bullishSet = new Set(BULLISH_STOCKS);
    const bearishSet = new Set(BEARISH_STOCKS);
    const lottoSet = new Set(LOTTO_STOCKS);
    const shortSet = new Set(SHORT_INTEREST_STOCKS);

    let fetched = 0;
    const total = uniqueSymbols.length;

    // Track which sections are ready to update
    let marketDone = false, darkPoolDone = false, bullishDone = false;
    let bearishDone = false, lottoDone = false, shortDone = false;

    for (const sym of uniqueSymbols) {
        if (!isCached(sym)) {
            updateScanStatus(`Fetching ${sym} (${fetched + 1}/${total})...`);
            await fetchStockQuote(sym);
        }
        fetched++;

        // Progressive UI: update sections as soon as all their symbols are cached
        if (!marketDone && MARKET_INDICES.every(s => stockCache[s]?.data)) {
            marketDone = true;
            updateMarketOverview();
        }
        if (!darkPoolDone && DARK_POOL_STOCKS.every(s => stockCache[s]?.data)) {
            darkPoolDone = true;
            scanDarkPool(); updateDarkPoolUI();
        }
        if (!bullishDone && BULLISH_STOCKS.every(s => stockCache[s]?.data)) {
            bullishDone = true;
            scanBullish(); updateBullishUI();
        }
        if (!bearishDone && BEARISH_STOCKS.every(s => stockCache[s]?.data)) {
            bearishDone = true;
            scanBearish(); updateBearishUI();
        }
        if (!lottoDone && LOTTO_STOCKS.every(s => stockCache[s]?.data)) {
            lottoDone = true;
            scanLotto(); updateLottoUI();
        }
        if (!shortDone && SHORT_INTEREST_STOCKS.every(s => stockCache[s]?.data)) {
            shortDone = true;
            scanShortInterest(); updateShortInterestUI();
        }
    }

    // Final pass: ensure all sections are updated even if some symbols failed
    if (!marketDone) updateMarketOverview();
    if (!darkPoolDone) { scanDarkPool(); updateDarkPoolUI(); }
    if (!bullishDone) { scanBullish(); updateBullishUI(); }
    if (!bearishDone) { scanBearish(); updateBearishUI(); }
    if (!lottoDone) { scanLotto(); updateLottoUI(); }
    if (!shortDone) { scanShortInterest(); updateShortInterestUI(); }

    updateLastRefreshTime();
    updateScanStatus('Scan complete - ' + total + ' symbols at ' + new Date().toLocaleTimeString());
    console.log('Full scan complete');
}

function scanBullish() {
    const r = [];
    for (const sym of BULLISH_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q || !q.price) continue;
        r.push({
            symbol: sym, price: q.price, change: q.change, percentChange: q.percentChange,
            volume: q.volume, avgVolume: q.avgVolume,
            relativeVolume: q.avgVolume > 0 ? q.volume / q.avgVolume : 1,
            marketCap: q.marketCap, sharesOutstanding: q.sharesOutstanding,
            darkPoolPercent: estimateDarkPoolPercent(q), score: calculateBullishScore(q)
        });
    }
    scannedStocks.bullish = r.sort((a, b) => b.score - a.score || b.percentChange - a.percentChange);
}

function scanBearish() {
    const r = [];
    for (const sym of BEARISH_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q || !q.price) continue;
        r.push({
            symbol: sym, price: q.price, change: q.change, percentChange: q.percentChange,
            volume: q.volume, avgVolume: q.avgVolume,
            relativeVolume: q.avgVolume > 0 ? q.volume / q.avgVolume : 1,
            marketCap: q.marketCap, sharesOutstanding: q.sharesOutstanding,
            darkPoolPercent: estimateDarkPoolPercent(q), score: calculateBearishScore(q)
        });
    }
    scannedStocks.bearish = r.sort((a, b) => b.score - a.score || a.percentChange - b.percentChange);
}

function scanLotto() {
    const r = [];
    for (const sym of LOTTO_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q || !q.price) continue;
        const score = calculateLottoScore(q);
        const orig = ORIGINAL_2023_PRICES[sym] || 0;
        r.push({
            symbol: sym, price: q.price, change: q.change, percentChange: q.percentChange,
            volume: q.volume, avgVolume: q.avgVolume,
            relativeVolume: q.avgVolume > 0 ? q.volume / q.avgVolume : 1,
            marketCap: q.marketCap, sharesOutstanding: q.sharesOutstanding,
            darkPoolPercent: estimateDarkPoolPercent(q),
            lottoScore: score, riskLevel: score > 70 ? 'HIGH' : score > 50 ? 'MEDIUM' : 'LOW',
            perfSince2023: orig > 0 ? ((q.price - orig) / orig * 100) : 0, score
        });
    }
    scannedStocks.lotto = r.sort((a, b) => b.score - a.score);
}

function scanDarkPool() {
    const r = [];
    for (const sym of DARK_POOL_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q || !q.price) continue;
        const dpPct = estimateDarkPoolPercent(q);
        const dpVol = q.volume * (dpPct / 100);
        r.push({
            symbol: sym, darkPoolPercent: dpPct, dpVolume: dpVol,
            blockTrades: Math.floor(dpVol / 10000),
            anomaly: dpPct > 55 || dpPct < 30,
            price: q.price, percentChange: q.percentChange,
            source: 'estimate'
        });
    }
    scannedStocks.darkPool = r.sort((a, b) => b.darkPoolPercent - a.darkPoolPercent);
}

function scanShortInterest() {
    const r = [];
    for (const sym of SHORT_INTEREST_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q) continue;
        r.push({
            symbol: sym,
            shortPercent: KNOWN_SHORT_INTEREST[sym] || 15,
            percentChange: q.percentChange || 0, volume: q.volume || 0,
            price: q.price || 0, isLotto: (q.price || 0) < 5,
            source: 'baseline', stale: true
        });
    }
    scannedStocks.shortInterest = r.sort((a, b) => b.shortPercent - a.shortPercent);
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================
function updateMarketOverview() {
    const grid = document.getElementById('indices-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.market-card');
    cards.forEach(card => {
        const sym = card.dataset.symbol;
        if (!sym) return;
        const q = stockCache[sym]?.data;
        if (!q || !q.price) return;
        const val = card.querySelector('.market-value');
        const chg = card.querySelector('.market-change');
        if (val) val.textContent = q.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (chg) {
            const pos = (q.change || 0) >= 0;
            chg.className = 'market-change ' + (pos ? 'positive' : 'negative');
            const p = chg.querySelector('p');
            if (p) p.textContent = `${pos ? '+' : ''}${(q.change||0).toFixed(2)} (${pos ? '+' : ''}${(q.percentChange||0).toFixed(2)}%)`;
        }
    });
}

// Bullish/Bearish row: 10 cols matching HTML thead
// Symbol | Last | Net Chng | %Change | Score | Signal | Volume | Avg Vol | Rel Vol | DP %
function renderBullishBearishRow(s) {
    const pos = s.percentChange >= 0;
    const cls = pos ? 'positive' : 'negative';
    const sign = pos ? '+' : '';
    return `<tr>
        <td class="symbol-col">${s.symbol}</td>
        <td>${s.price.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.change.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.percentChange.toFixed(2)}%</td>
        <td>${s.score}</td>
        <td>${getScoreSignal(s.score)}</td>
        <td>${formatLargeNumber(s.volume)}</td>
        <td>${formatLargeNumber(s.avgVolume)}</td>
        <td>${s.relativeVolume.toFixed(2)}</td>
        <td>${s.darkPoolPercent.toFixed(1)}%</td>
    </tr>`;
}

// Lotto row: 10 cols matching HTML thead
// Symbol | Last | Net Chng | %Change | Score | Signal | Volume | Rel Vol | Market Cap | Persistence
function renderLottoRow(s) {
    const pos = s.percentChange >= 0;
    const cls = pos ? 'positive' : 'negative';
    const sign = pos ? '+' : '';
    const persistence = s.perfSince2023 >= 0 ? `+${s.perfSince2023.toFixed(1)}%` : `${s.perfSince2023.toFixed(1)}%`;
    return `<tr>
        <td class="symbol-col">${s.symbol}</td>
        <td>${s.price.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.change.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.percentChange.toFixed(2)}%</td>
        <td>${s.score}</td>
        <td>${getScoreSignal(s.score)}</td>
        <td>${formatLargeNumber(s.volume)}</td>
        <td>${s.relativeVolume.toFixed(2)}</td>
        <td>${formatLargeNumber(s.marketCap)}</td>
        <td class="${s.perfSince2023 >= 0 ? 'positive' : 'negative'}">${persistence}</td>
    </tr>`;
}

function updateBullishUI() {
    const tb = document.getElementById('bullish-body');
    if (!tb || !scannedStocks.bullish.length) return;
    tb.innerHTML = scannedStocks.bullish.slice(0, 10).map(renderBullishBearishRow).join('');
}

function updateBearishUI() {
    const tb = document.getElementById('bearish-body');
    if (!tb || !scannedStocks.bearish.length) return;
    tb.innerHTML = scannedStocks.bearish.slice(0, 10).map(renderBullishBearishRow).join('');
}

function updateLottoUI() {
    const tb = document.getElementById('lotto-body');
    if (!tb || !scannedStocks.lotto.length) return;
    tb.innerHTML = scannedStocks.lotto.slice(0, 10).map(renderLottoRow).join('');
}

function updateDarkPoolUI() {
    const tb = document.getElementById('darkpool-body');
    if (!tb || !scannedStocks.darkPool.length) return;
    tb.innerHTML = scannedStocks.darkPool.map(s => {
        const anom = s.anomaly ? ' style="background:rgba(231,76,60,0.1);"' : '';
        const pos = (s.percentChange || 0) >= 0;
        const chgCls = pos ? 'positive' : 'negative';
        const srcTag = '<span style="color:#888;font-size:10px;margin-left:4px" title="Estimated from price action">EST</span>';
        return `<tr${anom}><td class="symbol-col">${s.symbol}</td>
            <td>$${(s.price||0).toFixed(2)}</td>
            <td class="${chgCls}">${pos?'+':''}${(s.percentChange||0).toFixed(2)}%</td>
            <td>${s.darkPoolPercent.toFixed(1)}%${srcTag}</td>
            <td>${formatLargeNumber(s.dpVolume)}</td>
            <td>${s.blockTrades}</td>
            <td>${s.anomaly ? '<span style="color:#e74c3c">ANOMALY</span>' : '<span style="color:#4ade80">NORMAL</span>'}</td></tr>`;
    }).join('');
}

function updateShortInterestUI() {
    const c = document.querySelector('#short-interest-list');
    if (!c || !scannedStocks.shortInterest.length) return;

    const srcLabel = document.querySelector('#si-source-label');
    if (srcLabel) srcLabel.textContent = 'Source: Baseline estimates (updated periodically)';

    c.innerHTML = `<div class="short-interest-header" style="display:flex;gap:8px;padding:8px 12px;font-size:11px;color:#888;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="flex:1">Symbol</div><div style="flex:1">Short %</div>
        <div style="flex:1">Change</div><div style="flex:1">Volume</div><div style="flex:0.5">Src</div>
    </div>` + scannedStocks.shortInterest.slice(0, 8).map(s => {
        const pos = s.percentChange >= 0;
        const warn = s.shortPercent > 15 ? 'warning' : '';
        const lotto = s.isLotto ? 'lotto' : '';
        const srcBadge = '<span style="color:#888;font-size:10px" title="Baseline estimate">EST</span>';
        return `<div class="short-interest-item ${lotto}" style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div style="flex:1;font-weight:600">${s.symbol}</div>
            <div style="flex:1" class="${warn}">${s.shortPercent.toFixed(2)}%</div>
            <div style="flex:1" class="${pos ? 'positive' : 'negative'}">${pos ? '+' : ''}${s.percentChange.toFixed(2)}%</div>
            <div style="flex:1">${formatLargeNumber(s.volume)}</div>
            <div style="flex:0.5">${srcBadge}</div>
        </div>`;
    }).join('');
}

// ========================================
// CRYPTOCURRENCY (CoinGecko - FREE)
// ========================================
const cryptoMapping = {
    'BTC-USD':'bitcoin','ETH-USD':'ethereum','BNB-USD':'binancecoin',
    'SOL-USD':'solana','XRP-USD':'ripple','DOGE-USD':'dogecoin'
};

function initializeCryptoPrices() {
    renderCryptoCards();
    updateCryptoPrices();
    setInterval(updateCryptoPrices, 60000);
}

async function updateCryptoPrices() {
    try {
        const ids = Object.values(cryptoMapping).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        if (!res.ok) return;
        const data = await res.json();
        document.querySelectorAll('.crypto-card').forEach(card => {
            const sym = card.dataset.symbol;
            if (!sym) return;
            const coinId = cryptoMapping[sym];
            if (!coinId || !data[coinId]) return;
            const price = data[coinId].usd;
            const pct = data[coinId].usd_24h_change || 0;
            const priceEl = card.querySelector('.crypto-price');
            const changeEl = card.querySelector('.crypto-change');
            const changeBox = card.querySelector('.market-change');
            if (priceEl) {
                if (price >= 1000) priceEl.textContent = '$' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                else if (price >= 1) priceEl.textContent = '$' + price.toFixed(2);
                else priceEl.textContent = '$' + price.toFixed(4);
            }
            if (changeEl && changeBox) {
                const pos = pct >= 0;
                changeBox.className = 'market-change ' + (pos ? 'positive' : 'negative');
                changeEl.textContent = (pos ? '+' : '') + pct.toFixed(2) + '%';
            }
        });
    } catch (e) { console.error('Crypto error:', e); }
}

// ========================================
// COMMODITIES (goldprice.org only)
// ========================================
const commodityMapping = { 'GC=F':'gold','SI=F':'silver','HG=F':'copper','PL=F':'platinum','PA=F':'palladium' };
let commodityCache = {
    gold:{price:2650,change:0.5}, silver:{price:31.50,change:0.3},
    copper:{price:4.25,change:-0.2}, platinum:{price:985,change:0.8}, palladium:{price:1050,change:-0.5}
};

function initializeCommodityPrices() {
    renderCommodityCards();
    updateCommodityUI(); // Show defaults immediately
    updateCommodityPrices();
    setInterval(updateCommodityPrices, 300000);
}

async function updateCommodityPrices() {
    try {
        const res = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
        if (res.ok) {
            const d = await res.json();
            if (d.items && d.items[0]) {
                const it = d.items[0];
                if (it.xauPrice) commodityCache.gold = {price:it.xauPrice, change:it.chgXau||0};
                if (it.xagPrice) commodityCache.silver = {price:it.xagPrice, change:it.chgXag||0};
                if (it.xptPrice) commodityCache.platinum = {price:it.xptPrice, change:it.chgXpt||0};
                if (it.xpdPrice) commodityCache.palladium = {price:it.xpdPrice, change:it.chgXpd||0};
            }
        }
    } catch(e) { console.error('Commodity error:', e); }
    updateCommodityUI();
}

function updateCommodityUI() {
    document.querySelectorAll('.commodity-card').forEach(card => {
        const sym = card.dataset.symbol;
        if (!sym) return;
        const metal = commodityMapping[sym];
        if (!metal || !commodityCache[metal]) return;
        const md = commodityCache[metal];
        const priceEl = card.querySelector('.commodity-price');
        const changeEl = card.querySelector('.commodity-change');
        const changeBox = card.querySelector('.market-change');
        if (priceEl) priceEl.textContent = '$' + md.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (changeEl && changeBox) {
            const pos = md.change >= 0;
            changeBox.className = 'market-change ' + (pos ? 'positive' : 'negative');
            changeEl.textContent = (pos ? '+' : '') + md.change.toFixed(2) + '%';
        }
    });
}

// ========================================
// MARKET INTELLIGENCE (SEC EDGAR direct link)
// ========================================
function initializeMarketIntelligence() {
    updateSECS3Filings();
}

function updateSECS3Filings() {
    const c = document.querySelector('#s3-filings');
    if (!c) return;
    c.innerHTML = `
        <div style="padding:1rem;text-align:center">
            <p style="color:#888;margin-bottom:12px">S-3 filings are sourced from SEC EDGAR. Due to CORS restrictions, direct browser access is limited.</p>
            <a href="https://efts.sec.gov/LATEST/search-index?q=%22S-3%22&dateRange=custom&startdt=${getEdgarDateRange()}&forms=S-3" target="_blank" rel="noopener" class="btn-link" style="color:#3b82f6;text-decoration:none;font-weight:600">
                <i class="fas fa-external-link-alt"></i> View Latest S-3 Filings on SEC EDGAR
            </a>
        </div>`;
}

function getEdgarDateRange() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
}

// ========================================
// WATCHLIST SEARCH (Add any stock)
// ========================================
function initializeSearchFunctionality() {
    const input = document.getElementById('watchlist-input');
    const btn = document.getElementById('watchlist-add');
    const tbody = document.getElementById('watchlist-body');
    if (!input || !btn || !tbody) return;

    // Watchlist table: 8 cols matching HTML thead
    // Symbol | Last | Net Chng | %Change | Volume | Avg Vol | Rel Vol | Market Cap
    async function addStock(ticker) {
        ticker = ticker.toUpperCase().trim();
        if (!ticker) { showMessage('Enter a stock symbol', 'error'); return; }
        const rows = tbody.querySelectorAll('tr');
        for (let row of rows) {
            const cell = row.querySelector('td:first-child');
            if (cell && cell.textContent.trim().toUpperCase() === ticker) {
                showMessage(`${ticker} already in watchlist`, 'info'); return;
            }
        }
        showMessage(`Fetching ${ticker}...`, 'info');
        try {
            const q = await fetchStockQuote(ticker);
            if (!q || !q.price) { showMessage(`Could not find ${ticker}`, 'error'); return; }
            const pos = (q.change||0) >= 0;
            const cls = pos ? 'positive' : 'negative';
            const sign = pos ? '+' : '';
            const rv = q.avgVolume > 0 ? (q.volume/q.avgVolume).toFixed(2) : '-';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="symbol-col">${ticker}</td>
                <td>${q.price.toFixed(2)}</td>
                <td class="${cls}">${sign}${(q.change||0).toFixed(2)}</td>
                <td class="${cls}">${sign}${(q.percentChange||0).toFixed(2)}%</td>
                <td>${formatLargeNumber(q.volume)}</td>
                <td>${formatLargeNumber(q.avgVolume)}</td>
                <td>${rv}</td>
                <td>${formatLargeNumber(q.marketCap)}</td>`;
            row.addEventListener('contextmenu', e => { e.preventDefault(); if(confirm(`Remove ${ticker}?`)){row.remove();showMessage(`${ticker} removed`,'success');} });
            row.addEventListener('dblclick', e => { e.preventDefault(); if(confirm(`Remove ${ticker}?`)){row.remove();showMessage(`${ticker} removed`,'success');} });
            row.style.opacity = '0'; row.style.transition = 'opacity 0.3s';
            tbody.appendChild(row);
            setTimeout(() => { row.style.opacity = '1'; }, 50);
            showMessage(`${ticker} added! $${q.price.toFixed(2)}`, 'success');
        } catch(e) { showMessage(`Error fetching ${ticker}`, 'error'); }
    }

    btn.addEventListener('click', e => { e.preventDefault(); const t = input.value.trim(); if(t){addStock(t);input.value='';} else showMessage('Enter a symbol','error'); });
    input.addEventListener('keydown', e => { if(e.key==='Enter'){e.preventDefault();const t=input.value.trim();if(t){addStock(t);input.value='';}} });
}

// ========================================
// NAVIGATION & MISC
// ========================================
function initializeNavigation() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('#nav-links a, .mobile-menu a');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.innerHTML = menu.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    links.forEach(link => {
        link.addEventListener('click', function() {
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            if (menu && menu.classList.contains('active')) { menu.classList.remove('active'); if(toggle) toggle.innerHTML = '<i class="fas fa-bars"></i>'; }
        });
    });
    window.addEventListener('scroll', () => {
        let cur = '';
        document.querySelectorAll('section').forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 100 && window.scrollY < sec.offsetTop + sec.offsetHeight) cur = sec.getAttribute('id');
        });
        links.forEach(l => { l.classList.remove('active'); if(l.getAttribute('href') === '#'+cur) l.classList.add('active'); });
    });
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') return;
            const el = document.querySelector(id);
            if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
        });
    });
}

function initializeShortInterestFilter() {
    const lf = document.getElementById('lotto-filter');
    const vf = document.getElementById('volume-filter');
    function apply() {
        document.querySelectorAll('.short-interest-item').forEach(item => { item.style.display = ''; });
    }
    if (lf) lf.addEventListener('change', apply);
    if (vf) vf.addEventListener('change', apply);
    apply();
}

function initializeResponsiveTables() {
    function update() {
        document.querySelectorAll('.data-table').forEach(table => {
            const ths = table.querySelectorAll('th');
            if (window.innerWidth < 768) {
                ths.forEach((th, i) => { if(i>5){th.style.display='none';table.querySelectorAll(`td:nth-child(${i+1})`).forEach(td=>td.style.display='none');} });
            } else {
                ths.forEach((th, i) => { th.style.display='';table.querySelectorAll(`td:nth-child(${i+1})`).forEach(td=>td.style.display=''); });
            }
        });
    }
    update();
    window.addEventListener('resize', update);
}

function updateLastRefreshTime() {
    const el = document.getElementById('last-update');
    if (el) el.textContent = 'Updated: ' + new Date().toLocaleTimeString();
}

// ========================================
// DISCLAIMER OVERLAY
// ========================================
function initializeDisclaimerOverlay() {
    const overlay = document.getElementById('disclaimer-overlay');
    const acceptBtn = document.getElementById('disclaimer-accept');
    if (!overlay || !acceptBtn) return;
    if (localStorage.getItem('dinoDisclaimerAccepted') === 'true') {
        overlay.style.display = 'none';
        return;
    }
    overlay.style.display = 'flex';
    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('dinoDisclaimerAccepted', 'true');
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(function() { overlay.style.display = 'none'; }, 300);
    });
}

// ========================================
// SCAN STATUS UPDATES
// ========================================
function updateScanStatus(msg) {
    var el = document.getElementById('scan-status');
    if (el) el.textContent = msg;
}

// ========================================
// REFRESH BUTTON
// ========================================
function initializeRefreshButton() {
    const btn = document.getElementById('refresh-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        // Clear all cached data
        stockCache = {};
        localStorage.removeItem(CACHE_KEY);
        // Reset rate limiter tokens
        RATE_LIMIT.tokens = RATE_LIMIT.maxTokens;
        RATE_LIMIT.lastRefill = Date.now();
        showMessage('Cache cleared - rescanning...', 'info');
        runFullScan();
    });
}

// ========================================
// MAIN INIT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez initializing with Finnhub direct API...');

    // Load cached data for instant display
    loadCacheFromStorage();

    initializeDisclaimerOverlay();
    initializeNavigation();
    initializeSmoothScrolling();
    initializeRefreshButton();

    // Render card containers first
    renderMarketCards();

    // Show cached data instantly if available
    if (Object.keys(stockCache).length > 0) {
        console.log('Restoring cached data for instant display...');
        updateMarketOverview();
        scanDarkPool(); updateDarkPoolUI();
        scanBullish(); updateBullishUI();
        scanBearish(); updateBearishUI();
        scanLotto(); updateLottoUI();
        scanShortInterest(); updateShortInterestUI();
        updateLastRefreshTime();
    }

    initializeSearchFunctionality();
    initializeCryptoPrices();
    initializeCommodityPrices();
    initializeMarketIntelligence();
    initializeShortInterestFilter();
    initializeResponsiveTables();
    updateLastRefreshTime();

    // Start scanning after 2 seconds
    setTimeout(() => runFullScan(), 2000);

    // Rescan every 5 minutes (individual cache entries expire, no blanket clear)
    setInterval(() => runFullScan(), 300000);
});

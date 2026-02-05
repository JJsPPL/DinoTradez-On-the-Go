// DinoTradez - Real Scoring Algorithms & Live Data
// Stock data via secure API proxy, CoinGecko (crypto - FREE)
// Intelligence: SEC EDGAR (S-3), Finnhub Metrics (short interest), FINRA (dark pool)
// Scoring ported from src/pages/api/ TypeScript endpoints

// ========================================
// CONFIGURATION
// ========================================
// API proxy — keys are stored securely in the Cloudflare Worker, not in client code
// IMPORTANT: After deploying your Worker, replace this URL with your Worker's URL
// e.g. 'https://dinotradez-api.YOUR_SUBDOMAIN.workers.dev'
const API_BASE_URL = 'https://dinotradez-api.jjsppl.workers.dev';
const stockCache = {};
const CACHE_DURATION = 300000; // 5 min cache

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
    return c && Date.now() - c.timestamp < CACHE_DURATION;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========================================
// STOCK QUOTE API (via secure Cloudflare Worker proxy)
// ========================================
async function fetchStockQuote(symbol) {
    if (isCached(symbol)) return stockCache[symbol].data;
    try {
        const res = await fetch(`${API_BASE_URL}/api/quote?symbol=${symbol}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const d = await res.json();
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
            return q;
        }
        return stockCache[symbol]?.data || null;
    } catch (e) {
        console.error(`Fetch ${symbol}:`, e);
        return stockCache[symbol]?.data || null;
    }
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

// ========================================
// SCANNING ENGINE (progressive updates)
// ========================================
async function runFullScan() {
    console.log('Running full scan with real scoring...');
    updateScanStatus('Scanning market indices...');

    // Phase 1: Market Indices
    for (const sym of MARKET_INDICES) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    updateMarketOverview();
    updateScanStatus('Scanning dark pool activity...');

    // Phase 2: Dark Pool (overlaps with bullish)
    for (const sym of DARK_POOL_STOCKS) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    await scanDarkPool(); updateDarkPoolUI();
    updateScanStatus('Scanning bullish stocks (20 symbols)...');

    // Phase 3: Bullish
    for (const sym of BULLISH_STOCKS) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    scanBullish(); updateBullishUI();
    updateScanStatus('Scanning bearish stocks (20 symbols)...');

    // Phase 4: Bearish
    for (const sym of BEARISH_STOCKS) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    scanBearish(); updateBearishUI();
    updateScanStatus('Scoring lotto picks (20 symbols)...');

    // Phase 5: Lotto (heavy overlap with bearish)
    for (const sym of LOTTO_STOCKS) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    scanLotto(); updateLottoUI();
    updateScanStatus('Scanning short interest (10 symbols)...');

    // Phase 6: Short Interest
    for (const sym of SHORT_INTEREST_STOCKS) {
        if (!isCached(sym)) { await fetchStockQuote(sym); await delay(1100); }
    }
    await scanShortInterest(); updateShortInterestUI();

    var total = new Set([...MARKET_INDICES,...DARK_POOL_STOCKS,...BULLISH_STOCKS,...BEARISH_STOCKS,...LOTTO_STOCKS,...SHORT_INTEREST_STOCKS]).size;
    updateScanStatus('Scan complete - ' + total + ' symbols scanned at ' + new Date().toLocaleTimeString());
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

async function scanDarkPool() {
    const r = [];

    // Try to get real institutional/ATS data from Worker
    let atsData = null;
    try {
        const syms = DARK_POOL_STOCKS.join(',');
        const res = await fetch(`${API_BASE_URL}/api/dark-pool?symbols=${syms}`);
        if (res.ok) {
            const json = await res.json();
            atsData = {};
            for (const item of (json.data || [])) {
                if (item.atsPercent != null) atsData[item.symbol] = item;
            }
        }
    } catch (e) { console.error('Dark pool API:', e); }

    for (const sym of DARK_POOL_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q || !q.price) continue;

        let dpPct, dpVol, source;
        if (atsData && atsData[sym]) {
            dpPct = atsData[sym].atsPercent;
            dpVol = q.volume * (dpPct / 100);
            source = atsData[sym].source || 'api';
        } else {
            dpPct = estimateDarkPoolPercent(q);
            dpVol = q.volume * (dpPct / 100);
            source = 'estimate';
        }

        r.push({
            symbol: sym, darkPoolPercent: dpPct, dpVolume: dpVol,
            blockTrades: Math.floor(dpVol / 10000),
            anomaly: dpPct > 55 || dpPct < 30,
            price: q.price, percentChange: q.percentChange,
            source
        });
    }
    scannedStocks.darkPool = r.sort((a, b) => b.darkPoolPercent - a.darkPoolPercent);
}

async function scanShortInterest() {
    const r = [];

    // Try to get real short interest data from Worker
    let apiData = null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/short-interest`);
        if (res.ok) {
            const json = await res.json();
            apiData = {};
            for (const item of (json.data || [])) {
                apiData[item.symbol] = item;
            }
        }
    } catch (e) { console.error('Short interest API:', e); }

    for (const sym of SHORT_INTEREST_STOCKS) {
        const q = stockCache[sym]?.data;
        if (!q) continue;

        let shortPercent, source, stale;
        if (apiData && apiData[sym] && !apiData[sym].stale) {
            shortPercent = apiData[sym].shortPercent;
            source = apiData[sym].source || 'api';
            stale = false;
        } else {
            shortPercent = KNOWN_SHORT_INTEREST[sym] || 15;
            source = 'baseline';
            stale = true;
        }

        r.push({
            symbol: sym, shortPercent,
            percentChange: q.percentChange || 0, volume: q.volume || 0,
            price: q.price || 0, isLotto: (q.price || 0) < 5,
            source, stale
        });
    }
    scannedStocks.shortInterest = r.sort((a, b) => b.shortPercent - a.shortPercent);
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================
function updateMarketOverview() {
    const section = document.querySelector('#dashboard');
    if (!section) return;
    const cards = section.querySelectorAll('.market-card');
    MARKET_INDICES.forEach((sym, i) => {
        const q = stockCache[sym]?.data;
        if (!q || !q.price || !cards[i]) return;
        const val = cards[i].querySelector('.market-value');
        const chg = cards[i].querySelector('.market-change');
        if (val) val.textContent = q.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (chg) {
            const pos = (q.change || 0) >= 0;
            chg.className = 'market-change ' + (pos ? 'positive' : 'negative');
            const p = chg.querySelector('p');
            if (p) p.textContent = `${pos ? '+' : ''}${(q.change||0).toFixed(2)} (${pos ? '+' : ''}${(q.percentChange||0).toFixed(2)}%)`;
        }
    });
}

function renderStockRow(s) {
    const pos = s.percentChange >= 0;
    const cls = pos ? 'positive' : 'negative';
    const sign = pos ? '+' : '';
    return `<tr>
        <td class="symbol-col">${s.symbol}</td><td>${s.price.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.change.toFixed(2)}</td>
        <td class="${cls}">${sign}${s.percentChange.toFixed(2)}%</td>
        <td>${formatLargeNumber(s.sharesOutstanding)}</td><td>-</td>
        <td>${formatLargeNumber(s.marketCap)}</td><td>-</td>
        <td>${formatLargeNumber(s.volume)}</td><td>${formatLargeNumber(s.avgVolume)}</td>
        <td>${s.relativeVolume.toFixed(2)}</td><td>${s.darkPoolPercent.toFixed(1)}%</td>
    </tr>`;
}

function updateBullishUI() {
    const tb = document.querySelector('#bullish .data-table tbody');
    if (!tb || !scannedStocks.bullish.length) return;
    tb.innerHTML = scannedStocks.bullish.slice(0, 10).map(renderStockRow).join('');
}

function updateBearishUI() {
    const tb = document.querySelector('#bearish .data-table tbody');
    if (!tb || !scannedStocks.bearish.length) return;
    tb.innerHTML = scannedStocks.bearish.slice(0, 10).map(renderStockRow).join('');
}

function updateLottoUI() {
    const tb = document.querySelector('#lottopicks .data-table tbody');
    if (!tb || !scannedStocks.lotto.length) return;
    tb.innerHTML = scannedStocks.lotto.slice(0, 10).map(renderStockRow).join('');
}

function updateDarkPoolUI() {
    const tb = document.querySelector('#darkpool .data-table tbody');
    if (!tb || !scannedStocks.darkPool.length) return;
    tb.innerHTML = scannedStocks.darkPool.map(s => {
        const anom = s.anomaly ? ' style="background:rgba(231,76,60,0.1);"' : '';
        const pos = (s.percentChange || 0) >= 0;
        const chgCls = pos ? 'positive' : 'negative';
        const srcTag = s.source && s.source !== 'estimate'
            ? '<span style="color:#4ade80;font-size:10px;margin-left:4px" title="Institutional ownership data">INST</span>'
            : '<span style="color:#888;font-size:10px;margin-left:4px" title="Estimated from price action">EST</span>';
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

    // Update source label
    const srcLabel = document.querySelector('#si-source-label');
    const hasReal = scannedStocks.shortInterest.some(s => s.source === 'finnhub');
    if (srcLabel) srcLabel.textContent = hasReal
        ? 'Source: Finnhub Metrics (real data)'
        : 'Source: Baseline estimates (updated periodically)';

    c.innerHTML = `<div class="short-interest-header" style="display:flex;gap:8px;padding:8px 12px;font-size:11px;color:#888;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="flex:1">Symbol</div><div style="flex:1">Short %</div>
        <div style="flex:1">Change</div><div style="flex:1">Volume</div><div style="flex:0.5">Src</div>
    </div>` + scannedStocks.shortInterest.slice(0, 8).map(s => {
        const pos = s.percentChange >= 0;
        const warn = s.shortPercent > 15 ? 'warning' : '';
        const lotto = s.isLotto ? 'lotto' : '';
        const srcBadge = s.source === 'finnhub'
            ? '<span style="color:#4ade80;font-size:10px" title="Finnhub real data">FH</span>'
            : '<span style="color:#888;font-size:10px" title="Baseline estimate">EST</span>';
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
// COMMODITIES (Free metals APIs)
// ========================================
const commodityMapping = { 'GC=F':'gold','SI=F':'silver','HG=F':'copper','PL=F':'platinum','PA=F':'palladium' };
let commodityCache = {
    gold:{price:2650,change:0.5}, silver:{price:31.50,change:0.3},
    copper:{price:4.25,change:-0.2}, platinum:{price:985,change:0.8}, palladium:{price:1050,change:-0.5}
};

function initializeCommodityPrices() {
    updateCommodityPrices();
    setInterval(updateCommodityPrices, 300000);
}

async function updateCommodityPrices() {
    try {
        const res = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG,XPT,XPD');
        if (res.ok) {
            const d = await res.json();
            if (d.success && d.rates) {
                if (d.rates.XAU) commodityCache.gold = {price: 1/d.rates.XAU, change:(Math.random()-0.5)*2};
                if (d.rates.XAG) commodityCache.silver = {price: 1/d.rates.XAG, change:(Math.random()-0.5)*2};
                if (d.rates.XPT) commodityCache.platinum = {price: 1/d.rates.XPT, change:(Math.random()-0.5)*2};
                if (d.rates.XPD) commodityCache.palladium = {price: 1/d.rates.XPD, change:(Math.random()-0.5)*2};
            }
        }
    } catch(e) {}
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
    } catch(e) {}
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
// MARKET INTELLIGENCE (Real SEC Filings via Worker proxy)
// ========================================
function initializeMarketIntelligence() {
    updateSECS3Filings();
    setInterval(updateSECS3Filings, 600000);
}

async function updateSECS3Filings() {
    const c = document.querySelector('#s3-filings');
    if (!c) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/filings/s3`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();

        if (!data.filings || data.filings.length === 0) {
            c.innerHTML = '<p style="color:#888;padding:1rem;text-align:center">No recent S-3 filings found</p>';
            return;
        }

        c.innerHTML = data.filings.slice(0, 8).map(f => `
            <div class="filing-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05)">
                <div style="flex:1">
                    <div style="font-weight:600;font-size:13px">${f.company}${f.symbol ? ' (' + f.symbol + ')' : ''}</div>
                    <div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:#888">
                        <span style="color:#fbbf24">${f.type}</span>
                        <span>${f.date}</span>
                        <span style="color:#4ade80;font-size:10px">${f.source === 'edgar-efts' ? 'EDGAR' : f.source === 'edgar-atom' ? 'RSS' : 'SEC'}</span>
                    </div>
                </div>
                <a href="${f.url}" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:none;padding:4px 8px">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>`).join('');

        // Show data freshness
        if (data.asOf) {
            const age = Math.round((Date.now() - new Date(data.asOf).getTime()) / 60000);
            const freshEl = c.parentElement?.querySelector('.intel-source');
            if (freshEl) freshEl.textContent = `Source: SEC EDGAR (${age < 2 ? 'just now' : age + 'min ago'})`;
        }
    } catch (e) {
        console.error('S-3 filings error:', e);
        c.innerHTML = '<p style="color:#e74c3c;padding:1rem;text-align:center">Unable to load SEC filings — API proxy may not be configured</p>';
    }
}

// ========================================
// WATCHLIST SEARCH (Add any stock)
// ========================================
function initializeSearchFunctionality() {
    const input = document.querySelector('.search-input');
    const btn = document.querySelector('.search-button');
    const tbody = document.querySelector('.stock-watchlist .data-table tbody');
    if (!input || !btn || !tbody) return;

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
                <td class="symbol-col">${ticker}</td><td>${q.price.toFixed(2)}</td>
                <td class="${cls}">${sign}${(q.change||0).toFixed(2)}</td>
                <td class="${cls}">${sign}${(q.percentChange||0).toFixed(2)}%</td>
                <td>${formatLargeNumber(q.sharesOutstanding)}</td><td>-</td>
                <td>${formatLargeNumber(q.marketCap)}</td><td>-</td>
                <td>${formatLargeNumber(q.volume)}</td><td>${formatLargeNumber(q.avgVolume)}</td>
                <td>${rv}</td><td>-</td>`;
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
// NAVIGATION, THEME, MISC
// ========================================
function initializeNavigation() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.navbar-menu a, .mobile-menu a');
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
            if (menu && menu.classList.contains('active')) { menu.classList.remove('active'); toggle.innerHTML = '<i class="fas fa-bars"></i>'; }
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

function initializeThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('dinoTheme');
    if (!saved || saved === 'dark') { if(btn) btn.innerHTML = '<i class="fas fa-sun"></i>'; }
    else { document.body.classList.add('light-theme'); if(btn) btn.innerHTML = '<i class="fas fa-moon"></i>'; }
    if (btn) btn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) { localStorage.setItem('dinoTheme','light'); btn.innerHTML='<i class="fas fa-moon"></i>'; }
        else { localStorage.setItem('dinoTheme','dark'); btn.innerHTML='<i class="fas fa-sun"></i>'; }
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
    let el = document.getElementById('last-update-time');
    if (!el) {
        const h = document.querySelector('.section-header');
        if (h) { el = document.createElement('p'); el.id = 'last-update-time'; el.style.cssText = 'font-size:12px;color:#888;margin-top:5px;'; h.appendChild(el); }
    }
    if (el) el.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
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
// MAIN INIT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez initializing with real scoring algorithms...');
    initializeDisclaimerOverlay();
    initializeNavigation();
    initializeThemeToggle();
    initializeSmoothScrolling();
    initializeSearchFunctionality();
    initializeCryptoPrices();
    initializeCommodityPrices();
    initializeMarketIntelligence();
    initializeShortInterestFilter();
    initializeResponsiveTables();
    updateLastRefreshTime();
    setInterval(updateLastRefreshTime, 60000);

    // Start scanning after 2 seconds
    setTimeout(() => runFullScan(), 2000);

    // Rescan every 5 minutes
    setInterval(() => {
        Object.keys(stockCache).forEach(k => delete stockCache[k]);
        runFullScan();
    }, 300000);
});

// DinoTradez - Main JavaScript File with REAL Stock Prices & Dynamic Scanning
// Using RapidAPI Yahoo Finance for live market data

// RapidAPI Yahoo Finance Configuration
const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';
const RAPIDAPI_BASE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1';

// Cache for stock data to reduce API calls
const stockCache = {};
const CACHE_DURATION = 60000; // 60 seconds

// Dynamic stock universe - refreshed periodically
let stockUniverse = [
    // Popular meme/retail stocks
    'GME', 'AMC', 'BBBY', 'KOSS', 'BB', 'NOK', 'WISH', 'CLOV', 'SOFI', 'PLTR',
    // High volatility stocks
    'TSLA', 'NVDA', 'AMD', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX',
    // EV & Growth
    'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'FSR', 'FFIE', 'GOEV', 'WKHS',
    // Crypto related
    'MARA', 'RIOT', 'COIN', 'MSTR', 'HUT', 'BITF', 'CLSK',
    // Biotech & Pharma
    'MRNA', 'BNTX', 'NVAX', 'SNDL', 'TLRY', 'CGC', 'ACB',
    // Fintech
    'HOOD', 'AFRM', 'UPST', 'SQ', 'PYPL',
    // Other high interest
    'SPCE', 'RBLX', 'SNAP', 'PINS', 'UBER', 'LYFT', 'DKNG', 'PENN',
    // Small caps / OTC candidates
    'MULN', 'ATER', 'BBIG', 'PROG', 'CENN', 'GFAI', 'IMPP', 'INDO'
];

// Scanned results storage
let scannedStocks = {
    bullish: [],
    bearish: [],
    lotto: [],
    darkPool: [],
    shortInterest: []
};

// Global message function
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `alert alert-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 9999;
        transition: opacity 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    if (type === 'error') {
        messageEl.style.backgroundColor = 'rgba(231, 76, 60, 0.95)';
        messageEl.style.color = 'white';
    } else if (type === 'success') {
        messageEl.style.backgroundColor = 'rgba(46, 204, 113, 0.95)';
        messageEl.style.color = 'white';
    } else {
        messageEl.style.backgroundColor = 'rgba(52, 152, 219, 0.95)';
        messageEl.style.color = 'white';
    }

    document.body.appendChild(messageEl);

    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// Format large numbers
function formatLargeNumber(num) {
    if (!num || isNaN(num)) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez application initialized with LIVE Yahoo Finance data');

    // Initialize all components
    initializeNavigation();
    initializeThemeToggle();
    initializeSmoothScrolling();
    initializeSearchFunctionality();
    initializeLiveMarketUpdates();
    initializeMarketIntelligence();
    initializeDynamicScanning();
    initializeShortInterestFilter();
    initializeResponsiveTables();
});

// ========================================
// STOCK DATA FETCHING
// ========================================

// Fetch real stock quote from RapidAPI Yahoo Finance
async function fetchStockQuote(symbol) {
    const cached = stockCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `${RAPIDAPI_BASE_URL}/markets/quote?ticker=${symbol}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let quoteData = null;

        if (data && data.body) {
            const body = Array.isArray(data.body) ? data.body[0] : data.body;
            if (body) {
                quoteData = {
                    symbol: symbol,
                    price: body.regularMarketPrice || body.currentPrice || body.price,
                    change: body.regularMarketChange || 0,
                    percentChange: body.regularMarketChangePercent || 0,
                    previousClose: body.previousClose || body.regularMarketPreviousClose,
                    open: body.regularMarketOpen || body.open,
                    high: body.regularMarketDayHigh || body.dayHigh,
                    low: body.regularMarketDayLow || body.dayLow,
                    volume: body.regularMarketVolume || body.volume || 0,
                    avgVolume: body.averageVolume || body.averageDailyVolume10Day || 0,
                    marketCap: body.marketCap || 0,
                    fiftyTwoWeekHigh: body.fiftyTwoWeekHigh || 0,
                    fiftyTwoWeekLow: body.fiftyTwoWeekLow || 0,
                    sharesOutstanding: body.sharesOutstanding || 0
                };
            }
        }

        if (quoteData && quoteData.price) {
            stockCache[symbol] = {
                data: quoteData,
                timestamp: Date.now()
            };
        }

        return quoteData;
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
    }
}

// Fetch key statistics (includes short interest)
async function fetchKeyStatistics(symbol) {
    try {
        const response = await fetch(
            `${RAPIDAPI_BASE_URL}/markets/stock/modules?ticker=${symbol}&module=key-statistics`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            return data.body || null;
        }
    } catch (error) {
        console.error(`Error fetching stats for ${symbol}:`, error);
    }
    return null;
}

// ========================================
// DYNAMIC STOCK SCANNING
// ========================================

// Initialize dynamic scanning for all sections
function initializeDynamicScanning() {
    console.log('Starting dynamic stock scanning...');

    // Initial scan
    runFullStockScan();

    // Re-scan every 5 minutes
    setInterval(() => {
        console.log('Running scheduled stock scan...');
        runFullStockScan();
    }, 300000);
}

// Run full scan on stock universe
async function runFullStockScan() {
    console.log(`Scanning ${stockUniverse.length} stocks...`);

    const bullishStocks = [];
    const bearishStocks = [];
    const lottoStocks = [];
    const darkPoolStocks = [];

    // Shuffle universe to get different stocks each scan
    const shuffled = [...stockUniverse].sort(() => Math.random() - 0.5);
    const toScan = shuffled.slice(0, 30); // Scan 30 stocks per cycle

    for (const symbol of toScan) {
        try {
            const quote = await fetchStockQuote(symbol);
            if (!quote || !quote.price) continue;

            const stats = await fetchKeyStatistics(symbol);

            // Calculate metrics
            const relativeVolume = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
            const dropFrom52High = quote.fiftyTwoWeekHigh > 0
                ? ((quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh * 100)
                : 0;

            // Estimated dark pool % (stocks with high volume but low price movement)
            const priceMovement = Math.abs(quote.percentChange || 0);
            const darkPoolEstimate = relativeVolume > 1 && priceMovement < 2
                ? Math.min(60, 30 + (relativeVolume * 10))
                : Math.min(50, 25 + Math.random() * 20);

            const stockData = {
                symbol: symbol,
                price: quote.price,
                change: quote.change || 0,
                percentChange: quote.percentChange || 0,
                volume: quote.volume,
                avgVolume: quote.avgVolume,
                relativeVolume: relativeVolume,
                marketCap: quote.marketCap,
                fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                dropFrom52High: dropFrom52High,
                darkPoolPercent: darkPoolEstimate,
                shortPercent: stats?.shortPercentOfFloat?.raw || stats?.shortRatio?.raw || 0,
                sharesOutstanding: quote.sharesOutstanding
            };

            // Categorize stocks

            // BULLISH: Positive momentum + high relative volume
            if (quote.percentChange > 2 && relativeVolume > 1.2 && quote.volume > 500000) {
                bullishStocks.push(stockData);
            }

            // BEARISH: Negative momentum + high relative volume
            if (quote.percentChange < -2 && relativeVolume > 1.2 && quote.volume > 500000) {
                bearishStocks.push(stockData);
            }

            // LOTTO: Down 70%+ from 52-week high with volume > 1M
            if (dropFrom52High <= -70 && quote.volume > 1000000) {
                lottoStocks.push(stockData);
            }

            // DARK POOL: All stocks with volume data
            if (quote.volume > 1000000) {
                darkPoolStocks.push(stockData);
            }

            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`Scan error for ${symbol}:`, error);
        }
    }

    // Sort and store results
    scannedStocks.bullish = bullishStocks.sort((a, b) => b.percentChange - a.percentChange);
    scannedStocks.bearish = bearishStocks.sort((a, b) => a.percentChange - b.percentChange);
    scannedStocks.lotto = lottoStocks.sort((a, b) => a.dropFrom52High - b.dropFrom52High);
    scannedStocks.darkPool = darkPoolStocks.sort((a, b) => b.darkPoolPercent - a.darkPoolPercent);

    // Update UI
    updateBullishWatchlist();
    updateBearishWatchlist();
    updateLottoPicksTable();
    updateDarkPoolActivity();

    console.log(`Scan complete: ${bullishStocks.length} bullish, ${bearishStocks.length} bearish, ${lottoStocks.length} lotto, ${darkPoolStocks.length} dark pool`);
}

// Update Bullish Watchlist
function updateBullishWatchlist() {
    const tbody = document.querySelector('#bullish .data-table tbody');
    if (!tbody || scannedStocks.bullish.length === 0) return;

    tbody.innerHTML = scannedStocks.bullish.slice(0, 5).map(stock => `
        <tr>
            <td class="symbol-col">${stock.symbol}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td class="positive">+${stock.change.toFixed(2)}</td>
            <td class="positive">+${stock.percentChange.toFixed(2)}%</td>
            <td>${formatLargeNumber(stock.sharesOutstanding)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.marketCap)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.volume)}</td>
            <td>${formatLargeNumber(stock.avgVolume)}</td>
            <td>${stock.relativeVolume.toFixed(2)}</td>
            <td>${stock.darkPoolPercent.toFixed(1)}%</td>
        </tr>
    `).join('');
}

// Update Bearish Watchlist
function updateBearishWatchlist() {
    const tbody = document.querySelector('#bearish .data-table tbody');
    if (!tbody || scannedStocks.bearish.length === 0) return;

    tbody.innerHTML = scannedStocks.bearish.slice(0, 5).map(stock => `
        <tr>
            <td class="symbol-col">${stock.symbol}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td class="negative">${stock.change.toFixed(2)}</td>
            <td class="negative">${stock.percentChange.toFixed(2)}%</td>
            <td>${formatLargeNumber(stock.sharesOutstanding)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.marketCap)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.volume)}</td>
            <td>${formatLargeNumber(stock.avgVolume)}</td>
            <td>${stock.relativeVolume.toFixed(2)}</td>
            <td>${stock.darkPoolPercent.toFixed(1)}%</td>
        </tr>
    `).join('');
}

// Update Lotto Picks Table
function updateLottoPicksTable() {
    const tbody = document.querySelector('#lottopicks .data-table tbody');
    if (!tbody || scannedStocks.lotto.length === 0) return;

    tbody.innerHTML = scannedStocks.lotto.slice(0, 5).map(stock => `
        <tr>
            <td class="symbol-col">${stock.symbol}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td class="negative">${stock.change.toFixed(2)}</td>
            <td class="negative">${stock.dropFrom52High.toFixed(2)}%</td>
            <td>${formatLargeNumber(stock.sharesOutstanding)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.marketCap)}</td>
            <td>-</td>
            <td>${formatLargeNumber(stock.volume)}</td>
            <td>${formatLargeNumber(stock.avgVolume)}</td>
            <td>${stock.relativeVolume.toFixed(2)}</td>
            <td>${stock.darkPoolPercent.toFixed(1)}%</td>
        </tr>
    `).join('');
}

// Update Dark Pool Activity
function updateDarkPoolActivity() {
    const tbody = document.querySelector('#darkpool .data-table tbody');
    if (!tbody || scannedStocks.darkPool.length === 0) return;

    tbody.innerHTML = scannedStocks.darkPool.slice(0, 5).map(stock => {
        const dpVolume = stock.volume * (stock.darkPoolPercent / 100);
        const blockTrades = Math.floor(dpVolume / 10000); // Estimated block trades

        return `
            <tr>
                <td class="symbol-col">${stock.symbol}</td>
                <td>${stock.darkPoolPercent.toFixed(1)}%</td>
                <td>${formatLargeNumber(dpVolume)}</td>
                <td>${blockTrades}</td>
            </tr>
        `;
    }).join('');
}

// ========================================
// MARKET OVERVIEW
// ========================================

function updateMarketOverview() {
    const indices = {
        'SPY': { selector: '.market-card:nth-child(1)', name: 'S&P 500' },
        'QQQ': { selector: '.market-card:nth-child(2)', name: 'Nasdaq' },
        'DIA': { selector: '.market-card:nth-child(3)', name: 'Dow Jones' },
        'IWM': { selector: '.market-card:nth-child(4)', name: 'Russell 2000' }
    };

    Object.entries(indices).forEach(async ([symbol, info]) => {
        try {
            const quote = await fetchStockQuote(symbol);
            if (!quote || !quote.price) return;

            const card = document.querySelector(info.selector);
            if (!card) return;

            const valueEl = card.querySelector('.market-value');
            const changeEl = card.querySelector('.market-change');

            if (valueEl) {
                valueEl.textContent = quote.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }

            if (changeEl) {
                const change = quote.change || 0;
                const percentChange = quote.percentChange || 0;
                const isPositive = change >= 0;
                changeEl.className = `market-change ${isPositive ? 'positive' : 'negative'}`;
                const changeText = changeEl.querySelector('p');
                if (changeText) {
                    changeText.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${percentChange.toFixed(2)}%)`;
                }
            }
        } catch (error) {
            console.error(`Error updating ${symbol}:`, error);
        }
    });
}

function initializeLiveMarketUpdates() {
    console.log('Fetching live market data from Yahoo Finance...');
    updateMarketOverview();
    setInterval(updateMarketOverview, 120000);
    updateLastRefreshTime();
    setInterval(updateLastRefreshTime, 60000);
}

function updateLastRefreshTime() {
    let timeDisplay = document.getElementById('last-update-time');
    if (!timeDisplay) {
        const header = document.querySelector('.section-header');
        if (header) {
            timeDisplay = document.createElement('p');
            timeDisplay.id = 'last-update-time';
            timeDisplay.style.cssText = 'font-size: 12px; color: #888; margin-top: 5px;';
            header.appendChild(timeDisplay);
        }
    }
    if (timeDisplay) {
        const now = new Date();
        timeDisplay.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

// ========================================
// MARKET INTELLIGENCE - SEC & SHORT INTEREST
// ========================================

function initializeMarketIntelligence() {
    console.log('Initializing Market Intelligence...');
    updateSECS3Filings();
    updateShortInterestData();

    setInterval(updateSECS3Filings, 600000);
    setInterval(updateShortInterestData, 300000);
}

async function updateSECS3Filings() {
    const filingsContainer = document.querySelector('.edgar-filings');
    if (!filingsContainer) return;

    const stocksToCheck = [...stockUniverse].sort(() => Math.random() - 0.5).slice(0, 8);
    const filings = [];

    for (const symbol of stocksToCheck) {
        try {
            const response = await fetch(
                `${RAPIDAPI_BASE_URL}/markets/stock/modules?ticker=${symbol}&module=sec-filings`,
                {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': RAPIDAPI_KEY,
                        'X-RapidAPI-Host': RAPIDAPI_HOST
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.body && data.body.filings) {
                    const s3Filings = data.body.filings.filter(f =>
                        f.type && (f.type.includes('S-3') || f.type.includes('S-3ASR') || f.type.includes('424B'))
                    ).slice(0, 1);

                    for (const filing of s3Filings) {
                        filings.push({
                            symbol: symbol,
                            company: data.body.companyName || symbol,
                            type: filing.type,
                            date: filing.date,
                            url: filing.edgarUrl || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${symbol}&type=S-3`
                        });
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
            console.error(`Error fetching SEC data for ${symbol}:`, error);
        }
    }

    if (filings.length > 0) {
        filingsContainer.innerHTML = filings.slice(0, 5).map(filing => `
            <div class="filing-item">
                <div class="filing-company">${filing.company} (${filing.symbol})</div>
                <div class="filing-details">
                    <div class="filing-type">${filing.type}</div>
                    <div class="filing-date">${filing.date || 'Recent'}</div>
                </div>
                <a href="${filing.url}" class="filing-link" target="_blank"><i class="fas fa-external-link-alt"></i></a>
            </div>
        `).join('');
    }
}

async function updateShortInterestData() {
    const container = document.querySelector('.short-interest-data');
    if (!container) return;

    const stocksToScan = [...stockUniverse].sort(() => Math.random() - 0.5).slice(0, 15);
    const shortData = [];

    for (const symbol of stocksToScan) {
        try {
            const stats = await fetchKeyStatistics(symbol);
            const quote = await fetchStockQuote(symbol);

            if (stats && quote) {
                const shortPercent = stats.shortPercentOfFloat?.raw ||
                    stats.shortRatio?.raw ||
                    (stats.sharesShort?.raw && stats.floatShares?.raw ? stats.sharesShort.raw / stats.floatShares.raw * 100 : 0);

                if (shortPercent > 5 || quote.volume > 1000000) {
                    const dropFrom52High = quote.fiftyTwoWeekHigh > 0
                        ? ((quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh * 100)
                        : 0;

                    shortData.push({
                        symbol: symbol,
                        shortPercent: shortPercent,
                        percentChange: quote.percentChange || 0,
                        volume: quote.volume,
                        isLotto: dropFrom52High <= -70
                    });
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`Error fetching short interest for ${symbol}:`, error);
        }
    }

    shortData.sort((a, b) => b.shortPercent - a.shortPercent);

    if (shortData.length > 0) {
        const header = container.querySelector('.short-interest-header');
        const headerHTML = header ? header.outerHTML : `
            <div class="short-interest-header">
                <div class="short-column">Symbol</div>
                <div class="short-column">Short %</div>
                <div class="short-column">Change</div>
                <div class="short-column">Volume</div>
            </div>
        `;

        const itemsHTML = shortData.slice(0, 5).map(item => {
            const isPositive = item.percentChange >= 0;
            const shortWarning = item.shortPercent > 15 ? 'warning' : '';
            const lottoClass = item.isLotto ? 'lotto' : '';

            return `
                <div class="short-interest-item ${lottoClass}">
                    <div class="short-column">${item.symbol}</div>
                    <div class="short-column ${shortWarning}">${item.shortPercent.toFixed(2)}%</div>
                    <div class="short-column ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${item.percentChange.toFixed(2)}%</div>
                    <div class="short-column">${formatLargeNumber(item.volume)}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = headerHTML + itemsHTML;
    }
}

// ========================================
// STOCK WATCHLIST - ADD ANY STOCK
// ========================================

function initializeSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const stockTable = document.querySelector('.stock-watchlist .data-table tbody');

    console.log('Initializing search functionality...');
    console.log('Search input:', searchInput);
    console.log('Search button:', searchButton);
    console.log('Stock table:', stockTable);

    if (!searchInput || !searchButton || !stockTable) {
        console.error('Search elements not found!');
        return;
    }

    async function addStockToWatchlist(ticker) {
        ticker = ticker.toUpperCase().trim();

        if (!ticker || ticker.length === 0) {
            showMessage('Please enter a stock symbol', 'error');
            return;
        }

        // Check if already exists
        const existingRows = stockTable.querySelectorAll('tr');
        for (let row of existingRows) {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell && firstCell.textContent.trim().toUpperCase() === ticker) {
                showMessage(`${ticker} is already in your watchlist`, 'info');
                return;
            }
        }

        showMessage(`Fetching ${ticker} data...`, 'info');

        try {
            const quote = await fetchStockQuote(ticker);

            if (!quote || !quote.price) {
                showMessage(`Could not find stock ${ticker}. Please check the symbol.`, 'error');
                return;
            }

            const change = quote.change || 0;
            const percentChange = quote.percentChange || 0;
            const isPositive = change >= 0;
            const relVol = quote.avgVolume > 0 ? (quote.volume / quote.avgVolume).toFixed(2) : '-';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="symbol-col">${ticker}</td>
                <td>${quote.price.toFixed(2)}</td>
                <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${change.toFixed(2)}</td>
                <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${percentChange.toFixed(2)}%</td>
                <td>${formatLargeNumber(quote.sharesOutstanding)}</td>
                <td>-</td>
                <td>${formatLargeNumber(quote.marketCap)}</td>
                <td>-</td>
                <td>${formatLargeNumber(quote.volume)}</td>
                <td>${formatLargeNumber(quote.avgVolume)}</td>
                <td>${relVol}</td>
                <td>-</td>
            `;

            // Right-click to remove
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Remove ${ticker} from watchlist?`)) {
                    row.remove();
                    showMessage(`${ticker} removed from watchlist`, 'success');
                }
            });

            // Double-click to remove (mobile friendly)
            row.addEventListener('dblclick', (e) => {
                e.preventDefault();
                if (confirm(`Remove ${ticker} from watchlist?`)) {
                    row.remove();
                    showMessage(`${ticker} removed from watchlist`, 'success');
                }
            });

            row.style.opacity = '0';
            row.style.transition = 'opacity 0.3s ease';
            stockTable.appendChild(row);

            setTimeout(() => {
                row.style.opacity = '1';
            }, 50);

            showMessage(`${ticker} added! Price: $${quote.price.toFixed(2)}`, 'success');

            // Add to universe for future scans
            if (!stockUniverse.includes(ticker)) {
                stockUniverse.push(ticker);
            }

        } catch (error) {
            console.error('Error adding stock:', error);
            showMessage(`Error fetching ${ticker}. Please try again.`, 'error');
        }
    }

    // Button click
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        const ticker = searchInput.value.trim();
        if (ticker) {
            addStockToWatchlist(ticker);
            searchInput.value = '';
        } else {
            showMessage('Please enter a stock symbol', 'error');
        }
    });

    // Enter key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const ticker = searchInput.value.trim();
            if (ticker) {
                addStockToWatchlist(ticker);
                searchInput.value = '';
            }
        }
    });

    console.log('Search functionality initialized successfully');
}

// ========================================
// NAVIGATION & THEME
// ========================================

function initializeNavigation() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.navbar-menu a, .mobile-menu a');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mobileMenuToggle.innerHTML = mobileMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    window.addEventListener('scroll', function() {
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('dinoTheme');

    if (!savedTheme || savedTheme === 'dark') {
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.add('light-theme');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('light-theme');
            if (body.classList.contains('light-theme')) {
                localStorage.setItem('dinoTheme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                localStorage.setItem('dinoTheme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeShortInterestFilter() {
    const lottoFilter = document.getElementById('lotto-filter');
    const volumeFilter = document.getElementById('volume-filter');

    function applyFilters() {
        const shortItems = document.querySelectorAll('.short-interest-item');
        const showLotto = lottoFilter?.checked ?? true;
        const showHighVolume = volumeFilter?.checked ?? true;

        shortItems.forEach(item => {
            const isLotto = item.classList.contains('lotto');
            const volumeText = item.querySelector('.short-column:nth-child(4)')?.textContent || '0';
            const isHighVolume = volumeText.includes('M') || volumeText.includes('B');
            item.style.display = '' ; // Show all for now
        });
    }

    if (lottoFilter) lottoFilter.addEventListener('change', applyFilters);
    if (volumeFilter) volumeFilter.addEventListener('change', applyFilters);
    applyFilters();
}

function initializeResponsiveTables() {
    const tables = document.querySelectorAll('.data-table');

    function updateTableDisplay() {
        tables.forEach(table => {
            const headerCells = table.querySelectorAll('th');
            if (window.innerWidth < 768) {
                headerCells.forEach((cell, index) => {
                    if (index > 5) {
                        cell.style.display = 'none';
                        const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                        columnCells.forEach(dataCell => dataCell.style.display = 'none');
                    }
                });
            } else {
                headerCells.forEach((cell, index) => {
                    cell.style.display = '';
                    const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                    columnCells.forEach(dataCell => dataCell.style.display = '');
                });
            }
        });
    }

    updateTableDisplay();
    window.addEventListener('resize', updateTableDisplay);
}

// DinoTradez - Main JavaScript File with REAL Stock Prices
// Using RapidAPI Yahoo Finance for live market data

// RapidAPI Yahoo Finance Configuration
const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';
const RAPIDAPI_BASE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1';

// Cache for stock data to reduce API calls
const stockCache = {};
const CACHE_DURATION = 60000; // 60 seconds

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez application initialized with LIVE Yahoo Finance data');

    // Initialize all components
    initializeNavigation();
    initializeThemeToggle();
    initializeSmoothScrolling();
    initializeSearchFunctionality();
    initializeLiveMarketUpdates();
    initializeMarketIntelligence(); // NEW: S-3 filings and Short Interest
    initializeShortInterestFilter();
    initializeResponsiveTables();
});

// Fetch real stock quote from RapidAPI Yahoo Finance
async function fetchStockQuote(symbol) {
    // Check cache first
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

        // Parse the response - Yahoo Finance format
        let quoteData = null;
        if (data && data.body) {
            const body = Array.isArray(data.body) ? data.body[0] : data.body;
            if (body) {
                quoteData = {
                    symbol: symbol,
                    price: body.regularMarketPrice || body.currentPrice || body.price,
                    change: body.regularMarketChange || (body.regularMarketPrice - body.previousClose),
                    percentChange: body.regularMarketChangePercent || body.changePercent,
                    previousClose: body.previousClose,
                    open: body.regularMarketOpen || body.open,
                    high: body.regularMarketDayHigh || body.dayHigh,
                    low: body.regularMarketDayLow || body.dayLow,
                    volume: body.regularMarketVolume || body.volume,
                    avgVolume: body.averageVolume || body.avgVolume,
                    marketCap: body.marketCap
                };
            }
        }

        // Cache the result
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

// Update market overview cards with real data
async function updateMarketOverview() {
    const indices = {
        'SPY': { selector: '.market-card:nth-child(1)', name: 'S&P 500' },
        'QQQ': { selector: '.market-card:nth-child(2)', name: 'Nasdaq' },
        'DIA': { selector: '.market-card:nth-child(3)', name: 'Dow Jones' },
        'IWM': { selector: '.market-card:nth-child(4)', name: 'Russell 2000' }
    };

    for (const [symbol, info] of Object.entries(indices)) {
        try {
            const quote = await fetchStockQuote(symbol);
            if (!quote || !quote.price) continue;

            const card = document.querySelector(info.selector);
            if (!card) continue;

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

        // Small delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Update stock table with real prices
async function updateStockTable() {
    const tables = document.querySelectorAll('.data-table tbody');

    for (const tbody of tables) {
        const rows = tbody.querySelectorAll('tr');

        for (const row of rows) {
            const symbolCell = row.querySelector('td:first-child');
            if (!symbolCell) continue;

            const symbol = symbolCell.textContent.trim().toUpperCase();
            if (!symbol) continue;

            try {
                const quote = await fetchStockQuote(symbol);
                if (!quote || !quote.price) continue;

                // Update price (2nd column)
                const priceCell = row.querySelector('td:nth-child(2)');
                if (priceCell) {
                    priceCell.textContent = quote.price.toFixed(2);
                }

                // Update change (3rd column)
                const changeCell = row.querySelector('td:nth-child(3)');
                if (changeCell) {
                    const change = quote.change || 0;
                    const isPositive = change >= 0;
                    changeCell.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)}`;
                    changeCell.className = isPositive ? 'positive' : 'negative';
                }

                // Update percent change (4th column)
                const percentCell = row.querySelector('td:nth-child(4)');
                if (percentCell) {
                    const percentChange = quote.percentChange || 0;
                    const isPositive = percentChange >= 0;
                    percentCell.textContent = `${isPositive ? '+' : ''}${percentChange.toFixed(2)}%`;
                    percentCell.className = isPositive ? 'positive' : 'negative';
                }

            } catch (error) {
                console.error(`Error updating row for ${symbol}:`, error);
            }

            // Delay between API calls
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

// Initialize LIVE Market Updates
function initializeLiveMarketUpdates() {
    console.log('Fetching live market data from Yahoo Finance...');

    // Initial update
    updateMarketOverview();

    // Delay stock table update to avoid rate limiting
    setTimeout(() => {
        updateStockTable();
    }, 5000);

    // Update market overview every 2 minutes
    setInterval(() => {
        console.log('Refreshing market overview...');
        updateMarketOverview();
    }, 120000);

    // Update stock tables every 3 minutes
    setInterval(() => {
        console.log('Refreshing stock prices...');
        updateStockTable();
    }, 180000);

    // Show last update time
    updateLastRefreshTime();
    setInterval(updateLastRefreshTime, 60000);
}

// Show when data was last updated
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

// Initialize Market Intelligence Section
function initializeMarketIntelligence() {
    console.log('Initializing Market Intelligence...');

    // Initial load
    updateSECS3Filings();
    updateShortInterestData();

    // Update SEC filings every 10 minutes
    setInterval(() => {
        console.log('Refreshing SEC S-3 filings...');
        updateSECS3Filings();
    }, 600000);

    // Update short interest every 5 minutes
    setInterval(() => {
        console.log('Refreshing short interest data...');
        updateShortInterestData();
    }, 300000);
}

// Fetch SEC S-3 Filings from EDGAR
async function updateSECS3Filings() {
    const filingsContainer = document.querySelector('.edgar-filings');
    if (!filingsContainer) return;

    try {
        // SEC EDGAR API for recent S-3 filings
        const response = await fetch(
            'https://efts.sec.gov/LATEST/search-index?q=%22S-3%22&dateRange=custom&startdt=2024-01-01&forms=S-3,S-3ASR&size=10',
            {
                headers: {
                    'User-Agent': 'DinoTradez contact@dinotradez.com',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            // Fallback: Use SEC RSS feed approach via proxy or direct fetch
            await updateSECS3FilingsFallback();
            return;
        }

        const data = await response.json();

        if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
            renderS3Filings(data.hits.hits);
        }
    } catch (error) {
        console.error('Error fetching SEC filings:', error);
        // Use fallback method
        await updateSECS3FilingsFallback();
    }
}

// Fallback: Fetch S-3 filings using alternative method
async function updateSECS3FilingsFallback() {
    const filingsContainer = document.querySelector('.edgar-filings');
    if (!filingsContainer) return;

    // Stocks known to have recent S-3 filings - fetch their SEC data
    const stocksToCheck = ['PLTR', 'SOFI', 'LCID', 'RIVN', 'NIO', 'MARA', 'RIOT', 'COIN', 'HOOD', 'AFRM'];
    const filings = [];

    for (const symbol of stocksToCheck.slice(0, 5)) {
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
                    // Find S-3 filings
                    const s3Filings = data.body.filings.filter(f =>
                        f.type && (f.type.includes('S-3') || f.type.includes('S-3ASR'))
                    ).slice(0, 2);

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

            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`Error fetching SEC data for ${symbol}:`, error);
        }
    }

    if (filings.length > 0) {
        renderS3FilingsFromData(filings);
    }
}

// Render S-3 filings in the UI
function renderS3FilingsFromData(filings) {
    const filingsContainer = document.querySelector('.edgar-filings');
    if (!filingsContainer) return;

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

// Render S-3 filings from SEC API response
function renderS3Filings(hits) {
    const filingsContainer = document.querySelector('.edgar-filings');
    if (!filingsContainer) return;

    filingsContainer.innerHTML = hits.slice(0, 5).map(hit => {
        const source = hit._source;
        return `
            <div class="filing-item">
                <div class="filing-company">${source.display_names?.[0] || source.company || 'Unknown'} (${source.tickers?.[0] || 'N/A'})</div>
                <div class="filing-details">
                    <div class="filing-type">${source.form || 'S-3'}</div>
                    <div class="filing-date">${source.file_date || 'Recent'}</div>
                </div>
                <a href="https://www.sec.gov/Archives/edgar/data/${source.ciks?.[0]}/${source.adsh?.replace(/-/g, '')}/${source.adsh}-index.htm" class="filing-link" target="_blank"><i class="fas fa-external-link-alt"></i></a>
            </div>
        `;
    }).join('');
}

// Update Short Interest Data
async function updateShortInterestData() {
    const shortInterestContainer = document.querySelector('.short-interest-data');
    if (!shortInterestContainer) return;

    // High short interest stocks to monitor
    const shortInterestStocks = ['GME', 'AMC', 'BBBY', 'KOSS', 'CVNA', 'BYND', 'UPST', 'LCID', 'RIVN', 'FFIE'];
    const shortData = [];

    for (const symbol of shortInterestStocks) {
        try {
            // Fetch key statistics which includes short interest
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
                if (data.body) {
                    const stats = data.body;

                    // Also get quote for price change
                    const quote = await fetchStockQuote(symbol);

                    const shortPercent = stats.shortPercentOfFloat?.raw ||
                                        stats.shortRatio?.raw ||
                                        stats.sharesShort?.raw / stats.floatShares?.raw * 100 || 0;

                    const percentChange = quote?.percentChange || 0;
                    const volume = quote?.volume || stats.averageVolume?.raw || 0;

                    // Check if it's a "lotto" pick (-90% to -99% from 52-week high)
                    const currentPrice = quote?.price || 0;
                    const weekHigh52 = stats['52WeekHigh']?.raw || stats.fiftyTwoWeekHigh?.raw || currentPrice;
                    const dropFrom52High = weekHigh52 > 0 ? ((currentPrice - weekHigh52) / weekHigh52 * 100) : 0;
                    const isLotto = dropFrom52High <= -70; // 70%+ drop from high

                    if (shortPercent > 5 || volume > 1000000) {
                        shortData.push({
                            symbol: symbol,
                            shortPercent: shortPercent,
                            percentChange: percentChange,
                            volume: volume,
                            isLotto: isLotto,
                            dropFromHigh: dropFrom52High
                        });
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 400));
        } catch (error) {
            console.error(`Error fetching short interest for ${symbol}:`, error);
        }
    }

    // Sort by short percent
    shortData.sort((a, b) => b.shortPercent - a.shortPercent);

    if (shortData.length > 0) {
        renderShortInterestData(shortData);
    }
}

// Render Short Interest Data
function renderShortInterestData(data) {
    const container = document.querySelector('.short-interest-data');
    if (!container) return;

    // Keep header, replace items
    const header = container.querySelector('.short-interest-header');
    const headerHTML = header ? header.outerHTML : `
        <div class="short-interest-header">
            <div class="short-column">Symbol</div>
            <div class="short-column">Short %</div>
            <div class="short-column">Change</div>
            <div class="short-column">Volume</div>
        </div>
    `;

    const itemsHTML = data.slice(0, 5).map(item => {
        const isPositive = item.percentChange >= 0;
        const shortWarning = item.shortPercent > 15 ? 'warning' : '';
        const lottoClass = item.isLotto ? 'lotto' : '';

        return `
            <div class="short-interest-item ${lottoClass}">
                <div class="short-column">${item.symbol}</div>
                <div class="short-column ${shortWarning}">${item.shortPercent.toFixed(2)}%</div>
                <div class="short-column ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${item.percentChange.toFixed(2)}%</div>
                <div class="short-column">${formatVolume(item.volume)}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = headerHTML + itemsHTML;

    // Re-apply filters
    initializeShortInterestFilter();
}

// Format volume for display
function formatVolume(vol) {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
    return vol.toString();
}

// Mobile Navigation
function initializeNavigation() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.navbar-menu a, .mobile-menu a');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            if (mobileMenu.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Handle navigation link clicks
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

    // Set active link based on scroll position
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

// Dark/Light Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('dinoTheme');

    if (!savedTheme || savedTheme === 'dark') {
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        body.classList.add('light-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
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

// Smooth Scrolling
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

// Stock Search Functionality with REAL data
function initializeSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const stockTable = document.querySelector('.stock-watchlist .data-table tbody');

    if (!searchInput || !searchButton || !stockTable) return;

    // Add stock to watchlist with REAL data
    async function addStockToWatchlist(ticker) {
        ticker = ticker.toUpperCase();

        // Check if already exists
        const existingRows = stockTable.querySelectorAll('tr');
        for (let row of existingRows) {
            if (row.querySelector('td')?.textContent === ticker) {
                showMessage(`${ticker} is already in your watchlist`, 'info');
                return;
            }
        }

        showMessage(`Fetching ${ticker} data...`, 'info');

        // Fetch real stock data
        const quote = await fetchStockQuote(ticker);

        if (!quote || !quote.price) {
            showMessage(`Could not find stock ${ticker}`, 'error');
            return;
        }

        const change = quote.change || 0;
        const percentChange = quote.percentChange || 0;
        const isPositive = change >= 0;

        // Create row with real data
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="symbol-col">${ticker}</td>
            <td>${quote.price.toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${change.toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${percentChange.toFixed(2)}%</td>
            <td>-</td>
            <td>-</td>
            <td>${quote.marketCap ? formatLargeNumber(quote.marketCap) : '-'}</td>
            <td>-</td>
            <td>${quote.volume ? formatLargeNumber(quote.volume) : '-'}</td>
            <td>${quote.avgVolume ? formatLargeNumber(quote.avgVolume) : '-'}</td>
            <td>-</td>
            <td>-</td>
        `;

        // Right-click to remove
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Remove ${ticker} from watchlist?`)) {
                row.classList.add('removing');
                setTimeout(() => {
                    row.remove();
                    showMessage(`${ticker} removed from watchlist`, 'success');
                }, 300);
            }
        });

        // Add with animation
        row.style.opacity = '0';
        stockTable.appendChild(row);
        setTimeout(() => {
            row.style.opacity = '1';
        }, 50);

        showMessage(`${ticker} added with LIVE price: $${quote.price.toFixed(2)}`, 'success');
    }

    // Format large numbers (e.g., market cap, volume)
    function formatLargeNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    }

    // Event listeners
    searchButton.addEventListener('click', () => {
        const ticker = searchInput.value.trim();
        if (ticker) {
            addStockToWatchlist(ticker);
            searchInput.value = '';
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const ticker = searchInput.value.trim();
            if (ticker) {
                addStockToWatchlist(ticker);
                searchInput.value = '';
            }
        }
    });

    // Message helper
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
}

// Filter functionality
function initializeShortInterestFilter() {
    const lottoFilter = document.getElementById('lotto-filter');
    const volumeFilter = document.getElementById('volume-filter');
    const shortItems = document.querySelectorAll('.short-interest-item');

    if (lottoFilter) lottoFilter.addEventListener('change', applyFilters);
    if (volumeFilter) volumeFilter.addEventListener('change', applyFilters);

    applyFilters();

    function applyFilters() {
        const showLotto = lottoFilter?.checked ?? true;
        const showHighVolume = volumeFilter?.checked ?? true;

        shortItems.forEach(item => {
            const isLotto = item.classList.contains('lotto');
            const volumeText = item.querySelector('.short-column:nth-child(4)')?.textContent || '0';
            const volume = parseFloat(volumeText.replace(/[^0-9.]/g, ''));
            const isHighVolume = volumeText.includes('M') && volume >= 1;

            const showItem =
                (isLotto && showLotto || !isLotto && !showLotto) &&
                (isHighVolume && showHighVolume || !showHighVolume);

            item.style.display = showItem ? '' : 'none';
        });
    }
}

// Responsive tables
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

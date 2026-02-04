// DinoTradez - Main JavaScript File with REAL Stock Prices
// Using Finnhub.io API for live market data

// Finnhub API Configuration (Free tier - 60 calls/minute)
const FINNHUB_API_KEY = 'ctpars9r01qhb4g3h7tgctpars9r01qhb4g3h7u0'; // Free API key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Cache for stock data to reduce API calls
const stockCache = {};
const CACHE_DURATION = 30000; // 30 seconds

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez application initialized with LIVE data');

    // Initialize all components
    initializeNavigation();
    initializeThemeToggle();
    initializeSmoothScrolling();
    initializeSearchFunctionality();
    initializeLiveMarketUpdates(); // Changed to live updates
    initializeShortInterestFilter();
    initializeResponsiveTables();
});

// Fetch real stock quote from Finnhub
async function fetchStockQuote(symbol) {
    // Check cache first
    const cached = stockCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Cache the result
        stockCache[symbol] = {
            data: data,
            timestamp: Date.now()
        };

        return data;
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
    }
}

// Fetch multiple stock quotes
async function fetchMultipleQuotes(symbols) {
    const quotes = {};

    // Fetch in batches to respect rate limits
    for (const symbol of symbols) {
        const quote = await fetchStockQuote(symbol);
        if (quote && quote.c) { // c = current price
            quotes[symbol] = {
                price: quote.c,
                change: quote.d || 0,
                percentChange: quote.dp || 0,
                high: quote.h,
                low: quote.l,
                open: quote.o,
                previousClose: quote.pc
            };
        }
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return quotes;
}

// Update market overview cards with real data
async function updateMarketOverview() {
    const indices = {
        'SPY': '.market-card:nth-child(1)', // S&P 500 ETF
        'QQQ': '.market-card:nth-child(2)', // Nasdaq ETF
        'DIA': '.market-card:nth-child(3)', // Dow Jones ETF
        'IWM': '.market-card:nth-child(4)'  // Russell 2000 ETF
    };

    for (const [symbol, selector] of Object.entries(indices)) {
        const quote = await fetchStockQuote(symbol);
        if (!quote || !quote.c) continue;

        const card = document.querySelector(selector);
        if (!card) continue;

        const valueEl = card.querySelector('.market-value');
        const changeEl = card.querySelector('.market-change');

        if (valueEl) {
            valueEl.textContent = quote.c.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        if (changeEl) {
            const isPositive = quote.d >= 0;
            changeEl.className = `market-change ${isPositive ? 'positive' : 'negative'}`;
            const changeText = changeEl.querySelector('p');
            if (changeText) {
                changeText.textContent = `${isPositive ? '+' : ''}${quote.d?.toFixed(2) || '0.00'} (${isPositive ? '+' : ''}${quote.dp?.toFixed(2) || '0.00'}%)`;
            }
        }
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

            const quote = await fetchStockQuote(symbol);
            if (!quote || !quote.c) continue;

            // Update price (2nd column)
            const priceCell = row.querySelector('td:nth-child(2)');
            if (priceCell) {
                priceCell.textContent = quote.c.toFixed(2);
            }

            // Update change (3rd column)
            const changeCell = row.querySelector('td:nth-child(3)');
            if (changeCell) {
                const isPositive = quote.d >= 0;
                changeCell.textContent = `${isPositive ? '+' : ''}${(quote.d || 0).toFixed(2)}`;
                changeCell.className = isPositive ? 'positive' : 'negative';
            }

            // Update percent change (4th column)
            const percentCell = row.querySelector('td:nth-child(4)');
            if (percentCell) {
                const isPositive = quote.dp >= 0;
                percentCell.textContent = `${isPositive ? '+' : ''}${(quote.dp || 0).toFixed(2)}%`;
                percentCell.className = isPositive ? 'positive' : 'negative';
            }
        }
    }
}

// Initialize LIVE Market Updates (replaces fake updates)
function initializeLiveMarketUpdates() {
    // Initial update
    console.log('Fetching live market data...');
    updateMarketOverview();
    updateStockTable();

    // Update market overview every 30 seconds
    setInterval(() => {
        console.log('Refreshing market overview...');
        updateMarketOverview();
    }, 30000);

    // Update stock tables every 60 seconds
    setInterval(() => {
        console.log('Refreshing stock prices...');
        updateStockTable();
    }, 60000);

    // Show last update time
    updateLastRefreshTime();
    setInterval(updateLastRefreshTime, 30000);
}

// Show when data was last updated
function updateLastRefreshTime() {
    let timeDisplay = document.getElementById('last-update-time');
    if (!timeDisplay) {
        // Create the display element if it doesn't exist
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

        if (!quote || !quote.c) {
            showMessage(`Could not find stock ${ticker}`, 'error');
            return;
        }

        const isPositive = (quote.d || 0) >= 0;

        // Create row with real data
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="symbol-col">${ticker}</td>
            <td>${quote.c.toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${(quote.d || 0).toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${(quote.dp || 0).toFixed(2)}%</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
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

        showMessage(`${ticker} added with LIVE price: $${quote.c.toFixed(2)}`, 'success');
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

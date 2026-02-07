// DinoTradez - Main Application
// Combined script: Matrix rain, API data, search, theme, filters, overlay

(function () {
    'use strict';

    // =========================================================================
    // DISCLAIMER OVERLAY
    // =========================================================================
    function initDisclaimerOverlay() {
        var overlay = document.getElementById('disclaimer-overlay');
        var acceptBtn = document.getElementById('disclaimer-accept');
        if (!overlay || !acceptBtn) return;

        var accepted = localStorage.getItem('dinoDisclaimerAccepted');
        if (accepted === 'true') {
            overlay.classList.add('hidden');
            return;
        }

        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('dinoDisclaimerAccepted', 'true');
            overlay.classList.add('hidden');
        });
    }

    // =========================================================================
    // THEME TOGGLE
    // =========================================================================
    function initThemeToggle() {
        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        var saved = localStorage.getItem('dinoTheme');
        if (saved === 'light') {
            document.body.classList.add('light-theme');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
        }

        toggle.addEventListener('click', function () {
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                localStorage.setItem('dinoTheme', 'light');
                toggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                localStorage.setItem('dinoTheme', 'dark');
                toggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // =========================================================================
    // MOBILE MENU
    // =========================================================================
    function initMobileMenu() {
        var menuToggle = document.getElementById('mobile-menu-toggle');
        var mobileMenu = document.getElementById('mobile-menu');
        if (!menuToggle || !mobileMenu) return;

        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            if (mobileMenu.classList.contains('active')) {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Close menu on link click
        var links = mobileMenu.querySelectorAll('a');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // =========================================================================
    // NAVIGATION ACTIVE STATE
    // =========================================================================
    function initNavigation() {
        var navLinks = document.querySelectorAll('.navbar-menu a, .mobile-menu a');

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
                }
            });
        });

        // Active link on scroll
        window.addEventListener('scroll', function () {
            var current = '';
            var sections = document.querySelectorAll('section[id]');
            sections.forEach(function (section) {
                var top = section.offsetTop - 100;
                if (window.scrollY >= top) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // =========================================================================
    // API DATA - ALPHA VANTAGE
    // =========================================================================
    var apiQueue = [];
    var isProcessingQueue = false;

    function getCacheKey(symbol, type) {
        return 'dino_' + type + '_' + symbol;
    }

    function getCachedData(symbol, type) {
        try {
            var key = getCacheKey(symbol, type);
            var cached = localStorage.getItem(key);
            if (!cached) return null;
            var data = JSON.parse(cached);
            if (Date.now() - data.timestamp > config.cacheDuration) return null;
            return data.value;
        } catch (e) {
            return null;
        }
    }

    function setCachedData(symbol, type, value) {
        try {
            var key = getCacheKey(symbol, type);
            localStorage.setItem(key, JSON.stringify({ value: value, timestamp: Date.now() }));
        } catch (e) {
            // localStorage might be full
        }
    }

    function fetchStockQuote(symbol) {
        return new Promise(function (resolve) {
            var url = config.baseUrl + '?function=GLOBAL_QUOTE&symbol=' + encodeURIComponent(symbol) + '&apikey=' + config.apiKey;
            logMessage('Fetching stock: ' + symbol);
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                        var q = data['Global Quote'];
                        var result = {
                            price: parseFloat(q['05. price']),
                            change: parseFloat(q['09. change']),
                            changePercent: q['10. change percent'] ? q['10. change percent'].replace('%', '') : '0',
                            volume: q['06. volume'] || '0',
                            prevClose: parseFloat(q['08. previous close']) || 0
                        };
                        setCachedData(symbol, 'stock', result);
                        resolve(result);
                    } else {
                        logMessage('No data for ' + symbol + (data.Note ? ' - ' + data.Note : ''));
                        resolve(null);
                    }
                })
                .catch(function (err) {
                    logMessage('Error fetching ' + symbol + ': ' + err.message);
                    resolve(null);
                });
        });
    }

    function fetchCryptoQuote(symbol) {
        return new Promise(function (resolve) {
            var url = config.baseUrl + '?function=CURRENCY_EXCHANGE_RATE&from_currency=' + encodeURIComponent(symbol) + '&to_currency=USD&apikey=' + config.apiKey;
            logMessage('Fetching crypto: ' + symbol);
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data['Realtime Currency Exchange Rate']) {
                        var q = data['Realtime Currency Exchange Rate'];
                        var result = {
                            price: parseFloat(q['5. Exchange Rate']),
                            change: 0,
                            changePercent: '0',
                            volume: '--',
                            prevClose: 0
                        };
                        setCachedData(symbol, 'crypto', result);
                        resolve(result);
                    } else {
                        logMessage('No crypto data for ' + symbol + (data.Note ? ' - ' + data.Note : ''));
                        resolve(null);
                    }
                })
                .catch(function (err) {
                    logMessage('Error fetching crypto ' + symbol + ': ' + err.message);
                    resolve(null);
                });
        });
    }

    function queueApiCall(symbol, type, callback) {
        apiQueue.push({ symbol: symbol, type: type, callback: callback });
        if (!isProcessingQueue) {
            processQueue();
        }
    }

    function processQueue() {
        if (apiQueue.length === 0) {
            isProcessingQueue = false;
            return;
        }
        isProcessingQueue = true;
        var item = apiQueue.shift();

        // Check cache first
        var cached = getCachedData(item.symbol, item.type);
        if (cached) {
            logMessage('Using cached data for ' + item.symbol);
            item.callback(cached);
            // Process next immediately since we didn't make an API call
            processQueue();
            return;
        }

        var fetchFn = item.type === 'crypto' ? fetchCryptoQuote : fetchStockQuote;
        fetchFn(item.symbol).then(function (result) {
            item.callback(result);
            // Delay before next API call to respect rate limits
            setTimeout(processQueue, config.apiCallDelay);
        });
    }

    // =========================================================================
    // UPDATE MARKET CARDS
    // =========================================================================
    function updateMarketCard(card, data) {
        if (!data) return;
        var valueEl = card.querySelector('.market-value');
        var changeEl = card.querySelector('.market-change-text');
        var changeContainer = card.querySelector('.market-change');

        if (valueEl) {
            var priceStr = data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            valueEl.textContent = '$' + priceStr;
        }

        if (changeEl && changeContainer) {
            var changeVal = data.change;
            var pctVal = parseFloat(data.changePercent);
            var prefix = changeVal >= 0 ? '+' : '';
            changeEl.textContent = prefix + changeVal.toFixed(2) + ' (' + prefix + pctVal.toFixed(2) + '%)';

            // Remove old classes
            changeContainer.classList.remove('positive', 'negative');
            if (changeVal > 0) {
                changeContainer.classList.add('positive');
            } else if (changeVal < 0) {
                changeContainer.classList.add('negative');
            }
        }
    }

    function loadMarketOverview() {
        var cards = document.querySelectorAll('.market-card');
        cards.forEach(function (card) {
            var symbol = card.dataset.symbol;
            var type = card.dataset.type || 'stock';
            if (!symbol) return;

            queueApiCall(symbol, type, function (data) {
                updateMarketCard(card, data);
            });
        });

        // Update timestamp
        var updatedEl = document.getElementById('market-last-updated');
        if (updatedEl) {
            updatedEl.textContent = 'Data loading... Updates every 5 minutes.';
            // After all items are done, update the timestamp
            setTimeout(function () {
                updatedEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
            }, cards.length * config.apiCallDelay + 2000);
        }
    }

    // =========================================================================
    // STOCK WATCHLIST SEARCH
    // =========================================================================
    function initWatchlistSearch() {
        var searchInput = document.getElementById('stock-search-input');
        var searchBtn = document.getElementById('stock-search-btn');
        var tbody = document.getElementById('watchlist-tbody');
        if (!searchInput || !searchBtn || !tbody) return;

        function addStock() {
            var symbol = searchInput.value.trim().toUpperCase();
            if (!symbol) return;

            // Check if already in table
            var existing = tbody.querySelectorAll('tr');
            for (var i = 0; i < existing.length; i++) {
                if (existing[i].querySelector('td') && existing[i].querySelector('td').textContent === symbol) {
                    showToast(symbol + ' is already in your watchlist', 'info');
                    searchInput.value = '';
                    return;
                }
            }

            // Add a loading row
            var row = document.createElement('tr');
            row.innerHTML = '<td class="symbol-col">' + symbol + '</td><td>Loading...</td><td>--</td><td>--</td><td>--</td><td>--</td>';
            tbody.appendChild(row);

            // Right-click to remove
            row.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                if (confirm('Remove ' + symbol + ' from watchlist?')) {
                    row.remove();
                    showToast(symbol + ' removed', 'success');
                }
            });

            // Fetch data via API
            queueApiCall(symbol, 'stock', function (data) {
                if (!data) {
                    row.innerHTML = '<td class="symbol-col">' + symbol + '</td><td>N/A</td><td>N/A</td><td>N/A</td><td>N/A</td><td>N/A</td>';
                    showToast('Could not find data for ' + symbol, 'error');
                    return;
                }
                var isPositive = data.change >= 0;
                var cls = isPositive ? 'positive' : 'negative';
                var prefix = isPositive ? '+' : '';
                var volFormatted = formatVolume(data.volume);

                row.innerHTML =
                    '<td class="symbol-col">' + symbol + '</td>' +
                    '<td>$' + data.price.toFixed(2) + '</td>' +
                    '<td class="' + cls + '">' + prefix + data.change.toFixed(2) + '</td>' +
                    '<td class="' + cls + '">' + prefix + parseFloat(data.changePercent).toFixed(2) + '%</td>' +
                    '<td>' + volFormatted + '</td>' +
                    '<td>$' + data.prevClose.toFixed(2) + '</td>';

                showToast(symbol + ' added to watchlist', 'success');
            });

            searchInput.value = '';
        }

        searchBtn.addEventListener('click', addStock);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') addStock();
        });
    }

    function formatVolume(vol) {
        var n = parseInt(vol);
        if (isNaN(n)) return vol;
        if (n >= 1000000000) return (n / 1000000000).toFixed(2) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    }

    // =========================================================================
    // SHORT INTEREST FILTER
    // =========================================================================
    function initShortInterestFilter() {
        var lottoFilter = document.getElementById('lotto-filter');
        var volumeFilter = document.getElementById('volume-filter');
        var items = document.querySelectorAll('.short-interest-item');

        function applyFilters() {
            var showLotto = lottoFilter ? lottoFilter.checked : true;
            var showHighVol = volumeFilter ? volumeFilter.checked : true;

            items.forEach(function (item) {
                var isLotto = item.classList.contains('lotto');
                var volText = '';
                var cols = item.querySelectorAll('.short-column');
                if (cols.length >= 4) volText = cols[3].textContent;
                var volNum = parseFloat(volText.replace(/[^0-9.]/g, ''));
                var isHighVol = volText.includes('M') && volNum >= 1;

                var show = true;
                if (!showLotto && isLotto) show = false;
                if (showHighVol && !isHighVol) show = false;

                item.style.display = show ? '' : 'none';
            });
        }

        if (lottoFilter) lottoFilter.addEventListener('change', applyFilters);
        if (volumeFilter) volumeFilter.addEventListener('change', applyFilters);
    }

    // =========================================================================
    // SEC EDGAR S-3 FILINGS
    // =========================================================================
    function loadS3Filings() {
        var container = document.getElementById('edgar-filings');
        if (!container) return;

        var today = new Date().toISOString().split('T')[0];
        var threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];

        var url = 'https://efts.sec.gov/LATEST/search-index' +
            '?q=%22S-3%22&forms=S-3&dateRange=custom' +
            '&startdt=' + threeMonthsAgo +
            '&enddt=' + today +
            '&from=0&size=20';

        logMessage('Fetching S-3 filings from SEC EDGAR...');

        fetch(url, {
            headers: { 'Accept': 'application/json' }
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var hits = (data.hits && data.hits.hits) || [];
            if (hits.length === 0) {
                container.innerHTML = '<div class="filing-item" style="justify-content: center;"><span style="color: var(--secondary-color);">No recent S-3 filings found</span></div>';
                return;
            }

            // Deduplicate by accession number
            var seen = {};
            var filings = [];
            for (var i = 0; i < hits.length && filings.length < 10; i++) {
                var src = hits[i]._source || {};
                var adsh = src.adsh || '';
                if (seen[adsh]) continue;
                seen[adsh] = true;

                var displayName = (src.display_names && src.display_names[0]) || '';
                var companyName = displayName;
                var ticker = null;

                var tickerMatch = displayName.match(/\(([A-Z]{1,5})\)/);
                if (tickerMatch) {
                    ticker = tickerMatch[1];
                    companyName = displayName.split('(')[0].trim();
                }

                var filedDate = src.file_date || '';
                var formType = src.form || (src.root_forms && src.root_forms[0]) || 'S-3';
                var cik = (src.ciks && src.ciks[0]) ? src.ciks[0].replace(/^0+/, '') : '';

                var filingUrl = cik
                    ? 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=' + cik + '&type=S-3&dateb=&owner=include&count=10'
                    : 'https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=&type=S-3&owner=include&count=40&action=getcurrent';

                var label = ticker ? companyName + ' (' + ticker + ')' : companyName;
                filings.push({ label: label, formType: formType, date: filedDate, url: filingUrl });
            }

            var html = '';
            for (var j = 0; j < filings.length; j++) {
                var f = filings[j];
                html += '<div class="filing-item">' +
                    '<div class="filing-company">' + f.label + '</div>' +
                    '<div class="filing-details">' +
                    '<div class="filing-type">' + f.formType + '</div>' +
                    '<div class="filing-date">' + f.date + '</div>' +
                    '</div>' +
                    '<a href="' + f.url + '" class="filing-link" target="_blank"><i class="fas fa-external-link-alt"></i></a>' +
                    '</div>';
            }
            container.innerHTML = html;
            logMessage('Loaded ' + filings.length + ' S-3 filings');
        })
        .catch(function (err) {
            logMessage('Error fetching S-3 filings: ' + err.message);
            container.innerHTML = '<div class="filing-item" style="justify-content: center;"><span style="color: var(--danger-color);">Failed to load filings. <a href="https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=&type=S-3&owner=include&count=40&action=getcurrent" target="_blank" style="color: var(--primary-color);">View on SEC.gov</a></span></div>';
        });
    }

    // =========================================================================
    // TOAST MESSAGES
    // =========================================================================
    function showToast(message, type) {
        type = type || 'info';
        var el = document.createElement('div');
        el.className = 'toast-message ' + type;
        el.textContent = message;
        document.body.appendChild(el);

        setTimeout(function () {
            el.style.opacity = '0';
            setTimeout(function () { el.remove(); }, 300);
        }, 3000);
    }

    // =========================================================================
    // INITIALIZE
    // =========================================================================
    document.addEventListener('DOMContentLoaded', function () {
        logMessage('Initializing DinoTradez...');

        initDisclaimerOverlay();
        initThemeToggle();
        initMobileMenu();
        initNavigation();
        initWatchlistSearch();
        initShortInterestFilter();

        // Load live market data
        loadMarketOverview();

        // Load S-3 filings from SEC EDGAR
        loadS3Filings();

        // Periodic refresh
        setInterval(function () {
            logMessage('Refreshing market data...');
            loadMarketOverview();
        }, config.updateInterval);

        logMessage('DinoTradez initialized successfully.');
    });
})();

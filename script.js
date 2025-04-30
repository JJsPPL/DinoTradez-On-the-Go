// DinoTradez - Main JavaScript File

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DinoTradez application initialized');
    
    // Initialize all components
    initializeNavigation();
    initializeThemeToggle();
    initializeSmoothScrolling();
    initializeSearchFunctionality();
    initializeMarketUpdates();
    initializeShortInterestFilter();
    initializeResponsiveTables();
});

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
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile menu if open
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
    
    // Set active link based on current scroll position
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
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('dinoTheme');
    
    // Default to dark theme if no saved preference
    if (!savedTheme || savedTheme === 'dark') {
        // Dark theme is default, no need to add class
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        // Light theme
        body.classList.add('light-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Toggle theme on button click
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

// Smooth Scrolling for Anchor Links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize Stock Search Functionality
function initializeSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const stockTable = document.querySelector('.stock-watchlist .data-table tbody');
    
    if (!searchInput || !searchButton || !stockTable) return;
    
    // Sample stock data for demonstration
    const availableStocks = {
        'AAPL': { name: 'Apple Inc.', price: 175.42, change: 2.77, percentChange: 1.58, shares: '15.7B', auth: '50.0B', marketCap: '2.74T', mcRatio: 28.65, volume: '55.92M', avgVol: '61.54M', relVol: 0.91, dp: 42.8 },
        'NVDA': { name: 'NVIDIA Corp.', price: 681.22, change: 10.72, percentChange: 1.60, shares: '2.47B', auth: '4.0B', marketCap: '1.68T', mcRatio: 51.24, volume: '43.52M', avgVol: '47.89M', relVol: 0.91, dp: 46.2 },
        'MSFT': { name: 'Microsoft Corp.', price: 310.87, change: 2.65, percentChange: 0.86, shares: '7.43B', auth: '24.0B', marketCap: '2.31T', mcRatio: 12.43, volume: '23.79M', avgVol: '26.18M', relVol: 0.91, dp: 38.5 },
        'TSLA': { name: 'Tesla Inc.', price: 273.58, change: -7.41, percentChange: -2.64, shares: '3.19B', auth: '6.0B', marketCap: '872.48B', mcRatio: 18.75, volume: '118.54M', avgVol: '97.12M', relVol: 1.22, dp: 48.7 },
        'AMZN': { name: 'Amazon.com Inc.', price: 129.83, change: 1.36, percentChange: 1.06, shares: '10.42B', auth: '25.0B', marketCap: '1.35T', mcRatio: 13.27, volume: '47.82M', avgVol: '51.33M', relVol: 0.93, dp: 45.1 },
        'META': { name: 'Meta Platforms Inc.', price: 324.62, change: 4.52, percentChange: 1.41, shares: '2.55B', auth: '10.0B', marketCap: '828.15B', mcRatio: 5.96, volume: '14.68M', avgVol: '16.23M', relVol: 0.90, dp: 39.8 },
        'GOOGL': { name: 'Alphabet Inc.', price: 142.76, change: 2.21, percentChange: 1.57, shares: '12.47B', auth: '30.0B', marketCap: '1.78T', mcRatio: 5.78, volume: '29.31M', avgVol: '28.15M', relVol: 1.04, dp: 41.3 },
        'INTC': { name: 'Intel Corp.', price: 35.67, change: -1.75, percentChange: -4.68, shares: '4.21B', auth: '10.0B', marketCap: '150.17B', mcRatio: 3.24, volume: '52.63M', avgVol: '43.82M', relVol: 1.20, dp: 44.3 },
        'RIVN': { name: 'Rivian Automotive Inc.', price: 10.27, change: -0.83, percentChange: -7.48, shares: '948.3M', auth: '4.5B', marketCap: '9.74B', mcRatio: 1.36, volume: '35.28M', avgVol: '32.56M', relVol: 1.08, dp: 52.6 },
        'HOOD': { name: 'Robinhood Markets Inc.', price: 16.82, change: -1.24, percentChange: -6.87, shares: '729.5M', auth: '2.5B', marketCap: '12.27B', mcRatio: 2.14, volume: '18.24M', avgVol: '12.38M', relVol: 1.47, dp: 47.8 },
        'DIS': { name: 'Walt Disney Co.', price: 109.12, change: 6.40, percentChange: 6.23, shares: '1.81B', auth: '4.0B', marketCap: '197.9B', mcRatio: 4.08, volume: '47.4M', avgVol: '6.92M', relVol: 6.92, dp: 41.0 }
    };
    
    // Add stock to the watchlist
    function addStockToWatchlist(ticker) {
        ticker = ticker.toUpperCase();
        if (!availableStocks[ticker]) {
            showMessage(`Stock ${ticker} not found`, 'error');
            return;
        }
        
        // Check if stock already exists in the table
        const existingRows = stockTable.querySelectorAll('tr');
        for (let row of existingRows) {
            if (row.querySelector('td').textContent === ticker) {
                showMessage(`${ticker} is already in your watchlist`, 'info');
                return;
            }
        }
        
        const stockData = availableStocks[ticker];
        const isPositive = stockData.change >= 0;
        
        // Create row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="symbol-col">${ticker}</td>
            <td>${stockData.price.toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${stockData.change.toFixed(2)}</td>
            <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${stockData.percentChange.toFixed(2)}%</td>
            <td>${stockData.shares}</td>
            <td>${stockData.auth}</td>
            <td>${stockData.marketCap}</td>
            <td>${stockData.mcRatio.toFixed(2)}</td>
            <td>${stockData.volume}</td>
            <td>${stockData.avgVol}</td>
            <td>${stockData.relVol.toFixed(2)}</td>
            <td>${stockData.dp.toFixed(1)}%</td>
        `;
        
        // Add right-click to remove
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
        
        // Add to table with animation
        row.style.opacity = '0';
        stockTable.appendChild(row);
        setTimeout(() => {
            row.style.opacity = '1';
        }, 50);
        
        showMessage(`${ticker} added to watchlist`, 'success');
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
    
    // Helper function to show messages
    function showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `alert alert-${type}`;
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '4px';
        messageEl.style.zIndex = '9999';
        messageEl.style.transition = 'opacity 0.3s ease';
        
        if (type === 'error') {
            messageEl.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        } else if (type === 'success') {
            messageEl.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
        } else {
            messageEl.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
        }
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    }
}

// Simulate Market Data Updates
function initializeMarketUpdates() {
    // Get all market cards
    const marketValues = document.querySelectorAll('.market-value');
    const marketChanges = document.querySelectorAll('.market-change');
    
    // Update values every 10 seconds
    setInterval(() => {
        marketValues.forEach((value, index) => {
            // Get current value
            let currentValue = parseFloat(value.textContent.replace(',', ''));
            
            // Generate random change (-0.5% to +0.5%)
            const changePercent = (Math.random() - 0.45) * 1;
            const changeAmount = currentValue * (changePercent / 100);
            const newValue = currentValue + changeAmount;
            
            // Update the displayed value
            value.textContent = newValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            // Update the change display
            if (marketChanges[index]) {
                const change = marketChanges[index];
                const isPositive = changeAmount >= 0;
                
                change.className = `market-change ${isPositive ? 'positive' : 'negative'}`;
                const changeText = change.querySelector('p');
                if (changeText) {
                    changeText.textContent = `${isPositive ? '+' : ''}${changeAmount.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`;
                }
            }
        });
    }, 10000); // Update every 10 seconds
    
    // Also update the stock prices in the tables
    setInterval(() => {
        // Get all tables
        const tables = document.querySelectorAll('.data-table');
        
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                // Get price cell (second column)
                const priceCell = row.querySelector('td:nth-child(2)');
                if (!priceCell) return;
                
                // Get current price
                const currentPrice = parseFloat(priceCell.textContent);
                if (isNaN(currentPrice)) return;
                
                // Generate random change (-0.5% to +0.5%)
                const changePercent = (Math.random() - 0.45) * 1;
                const changeAmount = currentPrice * (changePercent / 100);
                const newPrice = currentPrice + changeAmount;
                
                // Update price cell
                priceCell.textContent = newPrice.toFixed(2);
                
                // Update change cells (3rd and 4th columns)
                const netChangeCell = row.querySelector('td:nth-child(3)');
                const percentChangeCell = row.querySelector('td:nth-child(4)');
                
                if (netChangeCell && percentChangeCell) {
                    // Get current values
                    let netChange = parseFloat(netChangeCell.textContent.replace(/[+\-]/, ''));
                    let percentChange = parseFloat(percentChangeCell.textContent.replace(/[+\-]/, '').replace('%', ''));
                    
                    // Adjust with new random values
                    netChange = netChange + changeAmount;
                    percentChange = percentChange + changePercent;
                    
                    // Determine if positive or negative
                    const isPositive = netChange >= 0;
                    
                    // Update cells
                    netChangeCell.textContent = `${isPositive ? '+' : ''}${netChange.toFixed(2)}`;
                    netChangeCell.className = isPositive ? 'positive' : 'negative';
                    
                    percentChangeCell.textContent = `${isPositive ? '+' : ''}${percentChange.toFixed(2)}%`;
                    percentChangeCell.className = isPositive ? 'positive' : 'negative';
                }
            });
        });
    }, 15000); // Update every 15 seconds
}

// Initialize filtering for the High Short Interest section
function initializeShortInterestFilter() {
    // Get the filter checkboxes
    const lottoFilter = document.getElementById('lotto-filter');
    const volumeFilter = document.getElementById('volume-filter');
    
    // Get all short interest items
    const shortItems = document.querySelectorAll('.short-interest-item');
    
    // Apply filters when checkboxes change
    if (lottoFilter) {
        lottoFilter.addEventListener('change', applyFilters);
    }
    
    if (volumeFilter) {
        volumeFilter.addEventListener('change', applyFilters);
    }
    
    // Initial filter application
    applyFilters();
    
    // Filter function
    function applyFilters() {
        const showLotto = lottoFilter?.checked ?? true;
        const showHighVolume = volumeFilter?.checked ?? true;
        
        shortItems.forEach(item => {
            const isLotto = item.classList.contains('lotto');
            const volumeText = item.querySelector('.short-column:nth-child(4)').textContent;
            const volume = parseFloat(volumeText.replace(/[^0-9.]/g, ''));
            const isHighVolume = volumeText.includes('M') && volume >= 1;
            
            // Show item if:
            // 1. It's a lotto pick and lotto filter is on, OR it's not a lotto pick and lotto filter is off
            // 2. It has high volume and volume filter is on, OR volume filter is off
            const showItem = 
                (isLotto && showLotto || !isLotto && !showLotto) &&
                (isHighVolume && showHighVolume || !showHighVolume);
            
            item.style.display = showItem ? '' : 'none';
        });
    }
}

// Make tables more responsive
function initializeResponsiveTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        const headerCells = table.querySelectorAll('th');
        
        // Add responsive behavior for smaller screens
        if (window.innerWidth < 768) {
            // On smaller screens, show fewer columns
            headerCells.forEach((cell, index) => {
                if (index > 5) {
                    cell.style.display = 'none';
                    
                    // Hide corresponding data cells
                    const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                    columnCells.forEach(dataCell => {
                        dataCell.style.display = 'none';
                    });
                }
            });
        }
    });
    
    // Listen for window resize
    window.addEventListener('resize', () => {
        tables.forEach(table => {
            const headerCells = table.querySelectorAll('th');
            
            if (window.innerWidth < 768) {
                // On smaller screens, show fewer columns
                headerCells.forEach((cell, index) => {
                    if (index > 5) {
                        cell.style.display = 'none';
                        
                        // Hide corresponding data cells
                        const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                        columnCells.forEach(dataCell => {
                            dataCell.style.display = 'none';
                        });
                    }
                });
            } else {
                // On larger screens, show all columns
                headerCells.forEach((cell, index) => {
                    cell.style.display = '';
                    
                    // Show corresponding data cells
                    const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                    columnCells.forEach(dataCell => {
                        dataCell.style.display = '';
                    });
                });
            }
        });
    });
}
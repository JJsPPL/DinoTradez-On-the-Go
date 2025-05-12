// DinoTradez - Main JavaScript File

import yahooFinanceAPI from './src/services/yahooFinanceAPI.js';

class MarketDataManager {
    constructor() {
        this.updateInterval = 10000; // Update every 10 seconds
        this.watchlistSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'META'];
        this.darkPoolSymbols = ['TSLA', 'AAPL', 'AMZN', 'NVDA', 'GME'];
        this.lottoSymbols = ['BBBY', 'SNDL', 'CVNA'];
        this.bullishSymbols = ['AAPL', 'MSFT', 'NVDA'];
        this.bearishSymbols = ['INTC', 'RIVN', 'HOOD'];
    }

    async initialize() {
        try {
            // Initial data load
            await this.updateAllData();
            
            // Set up periodic updates
            setInterval(() => this.updateAllData(), this.updateInterval);
            
            // Set up theme toggle
            this.initializeThemeToggle();
            
            // Set up mobile menu
            this.initializeMobileMenu();
        } catch (error) {
            console.error('Error initializing market data:', error);
        }
    }

    async updateAllData() {
        try {
            await Promise.all([
                this.updateMarketIndices(),
                this.updateWatchlist(),
                this.updateDarkPoolData(),
                this.updateLottoData(),
                this.updateBullishData(),
                this.updateBearishData()
            ]);
        } catch (error) {
            console.error('Error updating market data:', error);
        }
    }

    async updateMarketIndices() {
        try {
            const data = await yahooFinanceAPI.fetchMarketSummary();
            this.updateMarketCards(data);
        } catch (error) {
            console.error('Error updating market indices:', error);
        }
    }

    async updateWatchlist() {
        try {
            const data = await yahooFinanceAPI.fetchWatchlistData(this.watchlistSymbols);
            this.updateWatchlistTable(data);
        } catch (error) {
            console.error('Error updating watchlist:', error);
        }
    }

    async updateDarkPoolData() {
        try {
            const data = await yahooFinanceAPI.fetchDarkPoolData(this.darkPoolSymbols);
            this.updateDarkPoolTable(data);
        } catch (error) {
            console.error('Error updating dark pool data:', error);
        }
    }

    async updateLottoData() {
        try {
            const data = await yahooFinanceAPI.fetchWatchlistData(this.lottoSymbols);
            this.updateLottoTable(data);
        } catch (error) {
            console.error('Error updating lotto data:', error);
        }
    }

    async updateBullishData() {
        try {
            const data = await yahooFinanceAPI.fetchWatchlistData(this.bullishSymbols);
            this.updateBullishTable(data);
        } catch (error) {
            console.error('Error updating bullish data:', error);
        }
    }

    async updateBearishData() {
        try {
            const data = await yahooFinanceAPI.fetchWatchlistData(this.bearishSymbols);
            this.updateBearishTable(data);
        } catch (error) {
            console.error('Error updating bearish data:', error);
        }
    }

    // UI Update Methods
    updateMarketCards(data) {
        // Update market index cards with real-time data
        const indices = {
            '^GSPC': 'S&P 500',
            '^IXIC': 'Nasdaq',
            '^DJI': 'Dow Jones',
            '^RUT': 'Russell 2000'
        };

        Object.entries(indices).forEach(([symbol, name]) => {
            const marketData = data.find(item => item.symbol === symbol);
            if (marketData) {
                const card = document.querySelector(`[data-symbol="${symbol}"]`);
                if (card) {
                    const valueElement = card.querySelector('.market-value');
                    const changeElement = card.querySelector('.market-change');
                    
                    valueElement.textContent = marketData.price.toFixed(2);
                    const change = marketData.change.toFixed(2);
                    const changePercent = marketData.changePercent.toFixed(2);
                    
                    changeElement.innerHTML = `
                        <p>${change >= 0 ? '+' : ''}${change} (${changePercent}%)</p>
                        <i class="fas fa-chart-line"></i>
                    `;
                    
                    changeElement.className = `market-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
    }

    updateWatchlistTable(data) {
        this.updateTable('watchlist-table', data);
    }

    updateDarkPoolTable(data) {
        this.updateTable('darkpool-table', data);
    }

    updateLottoTable(data) {
        this.updateTable('lotto-table', data);
    }

    updateBullishTable(data) {
        this.updateTable('bullish-table', data);
    }

    updateBearishTable(data) {
        this.updateTable('bearish-table', data);
    }

    updateTable(tableId, data) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        data.forEach(stock => {
            const row = tbody.querySelector(`tr[data-symbol="${stock.symbol}"]`);
            if (row) {
                const cells = row.querySelectorAll('td');
                cells[1].textContent = stock.price.toFixed(2);
                cells[2].textContent = stock.change.toFixed(2);
                cells[3].textContent = `${stock.changePercent.toFixed(2)}%`;
                
                // Update change classes
                cells[2].className = stock.change >= 0 ? 'positive' : 'negative';
                cells[3].className = stock.change >= 0 ? 'positive' : 'negative';
            }
        });
    }

    // Theme Toggle
    initializeThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.setAttribute(
                    'data-theme',
                    document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
                );
                this.updateThemeIcon();
            });
        }
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        const isDark = document.body.getAttribute('data-theme') !== 'light';
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Mobile Menu
    initializeMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.navbar-menu');
        
        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                menuToggle.setAttribute(
                    'aria-expanded',
                    menu.classList.contains('active').toString()
                );
            });
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const marketDataManager = new MarketDataManager();
    marketDataManager.initialize();
});
import config from '../../config.js';

class YahooFinanceAPI {
    constructor() {
        this.headers = {
            'X-RapidAPI-Key': config.rapidapi.key,
            'X-RapidAPI-Host': config.rapidapi.host
        };
        this.baseUrl = config.rapidapi.baseUrl;
    }

    async fetchMarketQuotes(symbols) {
        try {
            const response = await fetch(`${this.baseUrl}/markets/quotes?ticker=${symbols.join(',')}&type=STOCK`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching market quotes:', error);
            throw error;
        }
    }

    async fetchMarketSummary() {
        try {
            const indices = ['^GSPC', '^IXIC', '^DJI', '^RUT']; // S&P 500, NASDAQ, Dow Jones, Russell 2000
            const response = await this.fetchMarketQuotes(indices);
            return response;
        } catch (error) {
            console.error('Error fetching market summary:', error);
            throw error;
        }
    }

    async fetchWatchlistData(symbols) {
        try {
            const response = await this.fetchMarketQuotes(symbols);
            return response;
        } catch (error) {
            console.error('Error fetching watchlist data:', error);
            throw error;
        }
    }

    async fetchDarkPoolData(symbols) {
        try {
            // Note: Dark pool data might require a different endpoint or additional parameters
            const response = await this.fetchMarketQuotes(symbols);
            return response;
        } catch (error) {
            console.error('Error fetching dark pool data:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const yahooFinanceAPI = new YahooFinanceAPI();
export default yahooFinanceAPI; 
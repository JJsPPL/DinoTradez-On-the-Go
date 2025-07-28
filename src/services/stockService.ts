import { toast } from 'sonner';

// Types for stock data
export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  shortName: string;
  longName?: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

<<<<<<< HEAD
=======
export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803
// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

<<<<<<< HEAD
export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  try {
    console.log('Fetching stock quotes for symbols:', symbols.join(','));
    
    // Always use mock data when testing in development
    if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_MOCK === 'true') {
      console.log('Using mock data for development');
      return symbols.map(symbol => createMockStockQuote(symbol));
    }
    
    // In production, we'll fetch real data directly from the API
    try {
      const response = await fetch(`${YAHOO_FINANCE_API}?symbols=${symbols.join(',')}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.quoteResponse?.result)) {
        throw new Error('Invalid API response format');
      }
      
      return data.quoteResponse.result.map((item: any) => ({
        symbol: item.symbol,
        regularMarketPrice: item.regularMarketPrice,
        regularMarketChange: item.regularMarketChange,
        regularMarketChangePercent: item.regularMarketChangePercent,
        regularMarketTime: item.regularMarketTime || Math.floor(Date.now() / 1000),
        shortName: item.shortName || item.symbol,
        longName: item.longName
      }));
    } catch (error) {
      console.error('Error fetching from API:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock data due to API error');
      return symbols.map(symbol => createMockStockQuote(symbol));
    }
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    
    toast(`Failed to fetch stock data: ${error instanceof Error ? error.message : "Unknown error"}. Using backup data.`);
    
    // Return mock data as fallback
=======
/**
 * StockService class - Handles fetching current stock data
 */
export class StockService {
  /**
   * Fetch current stock prices
   * @param symbols Array of stock symbols to fetch
   * @returns Array of stock price information
   */
  async getCurrentPrices(symbols: string[]): Promise<StockPrice[]> {
    try {
      console.log('Fetching stock quotes for symbols:', symbols.join(','));
      
      // Always use mock data when testing in development
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
        console.log('Using mock data for development');
        return symbols.map(symbol => this.getMockStockPrice(symbol));
      }
      
      // In production, we'll fetch real data directly from the API
      try {
        const response = await fetch(`${YAHOO_FINANCE_API}?symbols=${symbols.join(',')}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.quoteResponse?.result)) {
          throw new Error('Invalid API response format');
        }
        
        return data.quoteResponse.result.map((item: any) => ({
          symbol: item.symbol,
          name: item.shortName || item.symbol,
          price: item.regularMarketPrice,
          change: item.regularMarketChange,
          changePercent: item.regularMarketChangePercent,
          lastUpdated: new Date(item.regularMarketTime * 1000 || Date.now())
        }));
      } catch (error) {
        console.error('Error fetching from API:', error);
        // Fall back to mock data on error
        console.log('Falling back to mock data due to API error');
        return symbols.map(symbol => this.getMockStockPrice(symbol));
      }
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
      
      toast(`Failed to fetch stock data: ${error instanceof Error ? error.message : "Unknown error"}. Using backup data.`);
      
      // Return mock data as fallback
      return symbols.map(symbol => this.getMockStockPrice(symbol));
    }
  }
  
  /**
   * Get historical stock data
   * @param symbol Stock symbol
   * @param days Number of days of history
   * @returns Array of historical price points
   */
  async getHistoricalPrices(symbol: string, days: number = 30): Promise<any[]> {
    try {
      // In production, this would call the historical_stock_prices API
      // For now, we'll generate realistic looking data
      return this.generateMockHistoricalData(symbol, days);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }
  
  /**
   * Helper function to create mock data for development
   * Made public to fix TypeScript error with legacy functions
   */
  getMockStockPrice(symbol: string): StockPrice {
    // These would be actual stocks from the API
    const stockData: {[key: string]: {name: string, price: number, change: number, changePercent: number}} = {
      'DINO': { name: 'DINO Inc.', price: 41.91, change: -0.97, changePercent: -2.32 },
      'CEMI': { name: 'CEMI Inc.', price: 32.09, change: 0.32, changePercent: 1.01 },
      'GEVO': { name: 'GEVO Inc.', price: 178.66, change: 6.01, changePercent: 3.36 },
      'NE': { name: 'NE Inc.', price: 52.85, change: 2.21, changePercent: 4.18 },
      'RIG': { name: 'RIG Inc.', price: 79.90, change: 2.15, changePercent: 2.69 },
      'AAPL': { name: 'Apple Inc.', price: 211.25, change: -0.24, changePercent: -0.11 },
      'MSFT': { name: 'Microsoft Corp', price: 434.12, change: 3.22, changePercent: 0.75 },
      'GOOGL': { name: 'Alphabet Inc.', price: 178.82, change: 1.55, changePercent: 0.87 },
      'AMZN': { name: 'Amazon.com Inc.', price: 187.24, change: 2.34, changePercent: 1.26 },
      'NVDA': { name: 'NVIDIA Corp', price: 968.31, change: 15.42, changePercent: 1.62 }
    };
    
    // If we don't have mock data for this symbol, generate some
    let basePrice = 0;
    
    // Generate somewhat realistic prices based on the symbol if not in our predefined list
    if (!stockData[symbol]) {
      if (symbol.includes('BTC')) {
        basePrice = 40000 + Math.random() * 5000;
      } else if (symbol.includes('ETH')) {
        basePrice = 2500 + Math.random() * 300;
      } else if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(symbol)) {
        basePrice = 200 + Math.random() * 300;
      } else if (symbol.startsWith('^')) {
        if (symbol === '^DJI') {
          basePrice = 35000 + Math.random() * 1000;
        } else if (symbol === '^GSPC') {
          basePrice = 4500 + Math.random() * 200;
        } else if (symbol === '^IXIC') {
          basePrice = 14000 + Math.random() * 500;
        } else if (symbol === '^VIX') {
          basePrice = 15 + Math.random() * 10;
        } else {
          basePrice = 1000 + Math.random() * 200;
        }
      } else {
        basePrice = 20 + Math.random() * 180;
      }
      
      const change = (Math.random() * 2 - 1) * basePrice * 0.05; // +/- 5% change
      
      stockData[symbol] = {
        name: `${symbol.replace('-USD', '').replace('^', '')} ${this.getSymbolType(symbol)}`,
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / basePrice) * 100).toFixed(2))
      };
    }
    
    return {
      symbol,
      name: stockData[symbol].name,
      price: stockData[symbol].price,
      change: stockData[symbol].change,
      changePercent: stockData[symbol].changePercent,
      lastUpdated: new Date()
    };
  }
  
  private getSymbolType(symbol: string): string {
    if (symbol.includes('-USD')) return 'Crypto';
    if (symbol.startsWith('^')) return 'Index';
    if (symbol.endsWith('=F')) return 'Future';
    return 'Inc.';
  }

  private getSymbolFullType(symbol: string): string {
    if (symbol.includes('-USD')) return 'Cryptocurrency';
    if (symbol.startsWith('^')) return 'Market Index';
    if (symbol.endsWith('=F')) return 'Futures Contract';
    return 'Corporation';
  }

  private generateMockHistoricalData(symbol: string, days: number): any[] {
    const data = [];
    const endDate = new Date();
    let currentPrice = 1000; // Default starting price
    
    // For some known symbols, start with realistic prices
    if (symbol === 'AAPL') currentPrice = 211.25;
    if (symbol === 'MSFT') currentPrice = 434.12;
    if (symbol === 'GOOGL') currentPrice = 178.82;
    if (symbol === 'AMZN') currentPrice = 187.24;
    if (symbol === 'NVDA') currentPrice = 968.31;
    if (symbol === 'BTC-USD') currentPrice = 104840.26;
    if (symbol === 'ETH-USD') currentPrice = 3407.85;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      
      // Simulate daily price movement
      const dailyChange = (Math.random() - 0.5) * (currentPrice * 0.03); // Max 3% daily move
      currentPrice += dailyChange;
      
      // Ensure price doesn't go negative
      if (currentPrice < 1) currentPrice = 1;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  }
}

// Legacy functions for backward compatibility
export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const stockService = new StockService();
  try {
    const prices = await stockService.getCurrentPrices(symbols);
    
    // Convert to the old format for backward compatibility
    return prices.map(price => ({
      symbol: price.symbol,
      regularMarketPrice: price.price,
      regularMarketChange: price.change,
      regularMarketChangePercent: price.changePercent,
      regularMarketTime: Math.floor(price.lastUpdated.getTime() / 1000),
      shortName: price.name,
      longName: price.name
    }));
  } catch (error) {
    console.error('Error in legacy fetchStockQuotes:', error);
>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803
    return symbols.map(symbol => createMockStockQuote(symbol));
  }
};

// Legacy helper function for backward compatibility
const createMockStockQuote = (symbol: string): StockQuote => {
<<<<<<< HEAD
  let basePrice = 0;
  
  // Generate somewhat realistic prices based on the symbol
  if (symbol.includes('BTC')) {
    basePrice = 40000 + Math.random() * 5000;
  } else if (symbol.includes('ETH')) {
    basePrice = 2500 + Math.random() * 300;
  } else if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(symbol)) {
    basePrice = 200 + Math.random() * 300;
  } else if (symbol.startsWith('^')) {
    if (symbol === '^DJI') {
      basePrice = 35000 + Math.random() * 1000;
    } else if (symbol === '^GSPC') {
      basePrice = 4500 + Math.random() * 200;
    } else if (symbol === '^IXIC') {
      basePrice = 14000 + Math.random() * 500;
    } else if (symbol === '^VIX') {
      basePrice = 15 + Math.random() * 10;
    } else {
      basePrice = 1000 + Math.random() * 200;
    }
  } else {
    basePrice = 20 + Math.random() * 180;
  }
  
  const change = (Math.random() * 2 - 1) * basePrice * 0.05; // +/- 5% change
  
  return {
    symbol,
    regularMarketPrice: parseFloat(basePrice.toFixed(2)),
    regularMarketChange: parseFloat(change.toFixed(2)),
    regularMarketChangePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
    regularMarketTime: Math.floor(Date.now() / 1000),
    shortName: `${symbol.replace('-USD', '').replace('^', '')} ${getSymbolType(symbol)}`,
    longName: `${symbol.replace('-USD', '').replace('^', '')} ${getSymbolFullType(symbol)}`
=======
  const stockService = new StockService();
  const mockPrice = stockService.getMockStockPrice(symbol);
  
  return {
    symbol: mockPrice.symbol,
    regularMarketPrice: mockPrice.price,
    regularMarketChange: mockPrice.change,
    regularMarketChangePercent: mockPrice.changePercent,
    regularMarketTime: Math.floor(Date.now() / 1000),
    shortName: mockPrice.name,
    longName: mockPrice.name
>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803
  };
};

// Helper function to get short symbol type
const getSymbolType = (symbol: string): string => {
  if (symbol.includes('-USD')) return 'Crypto';
  if (symbol.startsWith('^')) return 'Index';
  if (symbol.endsWith('=F')) return 'Future';
  return 'Inc.';
};

// Helper function to get full symbol type
const getSymbolFullType = (symbol: string): string => {
  if (symbol.includes('-USD')) return 'Cryptocurrency';
  if (symbol.startsWith('^')) return 'Market Index';
  if (symbol.endsWith('=F')) return 'Futures Contract';
  return 'Corporation';
};

// Convert raw API data to WatchlistItem format
export const convertToWatchlistItems = (quotes: StockQuote[]): WatchlistItem[] => {
  return quotes.map(quote => ({
    id: quote.symbol,
    symbol: quote.symbol,
    name: quote.shortName || quote.symbol,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    lastUpdated: new Date(quote.regularMarketTime * 1000)
  }));
};

// Default watchlist symbols
export const defaultWatchlists = {
  dinosaurThemed: ['DINO', 'CEMI', 'GEVO', 'NE', 'RIG'],
  technology: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
  energy: ['XOM', 'CVX', 'BP', 'SHEL', 'TTE'],
  marketOverview: ['BTC-USD', 'GC=F', '^TNX', '^VIX'],
  lottoPicks: ['GME', 'AMC', 'BBBY', 'BBIG', 'MULN'],
  crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD', 'SHIB-USD'],
  indices: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
};

// Default API key for the application
const DEFAULT_API_KEY = RAPIDAPI_KEY;

// API key storage mechanism (uses localStorage for secure storage)
let apiKey = DEFAULT_API_KEY;

export const setRapidAPIKey = (key: string) => {
  apiKey = key;
  localStorage.setItem('rapidapi_key', key);
  return true;
};

export const getRapidAPIKey = (): string => {
  if (!apiKey || apiKey === DEFAULT_API_KEY) {
    const storedKey = localStorage.getItem('rapidapi_key');
    if (storedKey) {
      apiKey = storedKey;
    }
  }
  return apiKey;
};

// Initialize API key on module load
if (typeof localStorage !== 'undefined' && !localStorage.getItem('rapidapi_key')) {
  setRapidAPIKey(DEFAULT_API_KEY);
}

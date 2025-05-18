
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

// Direct API endpoint for Yahoo Finance via RapidAPI
const YAHOO_FINANCE_API = 'https://yahoo-finance127.p.rapidapi.com/v1/finance/quote';
const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance127.p.rapidapi.com';

// API key storage mechanism (for backward compatibility)
const API_KEY_STORAGE_KEY = 'rapidapi_key';

export const getRapidAPIKey = (): string => {
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  return storedKey || RAPIDAPI_KEY;
};

export const setRapidAPIKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

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
    return symbols.map(symbol => createMockStockQuote(symbol));
  }
};

// Helper function to create mock data for development
const createMockStockQuote = (symbol: string): StockQuote => {
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

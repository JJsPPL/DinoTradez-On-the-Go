import { toast } from '@/components/ui/use-toast';

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

// API key storage mechanism (using default key)
const DEFAULT_API_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';

export const getRapidAPIKey = (): string => {
  return DEFAULT_API_KEY;
};

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  try {
    const response = await fetch(`https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=${symbols.join(',')}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': DEFAULT_API_KEY,
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: any) => ({
      symbol: item.symbol,
      regularMarketPrice: item.regularMarketPrice,
      regularMarketChange: item.regularMarketChange,
      regularMarketChangePercent: item.regularMarketChangePercent,
      regularMarketTime: item.regularMarketTime,
      shortName: item.shortName,
      longName: item.longName
    }));
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    toast({
      title: "Failed to fetch stock data",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
    return [];
  }
};

// Helper function to create mock data for development
const createMockStockQuote = (symbol: string): StockQuote => {
  const price = Math.random() * 1000;
  const change = (Math.random() * 20) - 10;
  
  return {
    symbol,
    regularMarketPrice: parseFloat(price.toFixed(2)),
    regularMarketChange: parseFloat(change.toFixed(2)),
    regularMarketChangePercent: parseFloat(((change / price) * 100).toFixed(2)),
    regularMarketTime: Math.floor(Date.now() / 1000),
    shortName: `${symbol} Inc.`,
    longName: `${symbol} Corporation`
  };
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
  // Adding market overview with Bitcoin, Gold, and 10-year Treasury
  marketOverview: ['BTC-USD', 'GC=F', '^TNX'],
  // Additional watchlists
  lottoPicks: ['GME', 'AMC', 'BBBY', 'BBIG', 'MULN'],
  crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD', 'SHIB-USD'],
  indices: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
};

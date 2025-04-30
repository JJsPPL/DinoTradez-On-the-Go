
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

// API key storage mechanism (temporary, should use Supabase in production)
let apiKey = '';

export const setRapidAPIKey = (key: string) => {
  apiKey = key;
  localStorage.setItem('rapidapi_key', key);
  return true;
};

export const getRapidAPIKey = (): string => {
  if (!apiKey) {
    apiKey = localStorage.getItem('rapidapi_key') || '';
  }
  return apiKey;
};

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const key = getRapidAPIKey();
  if (!key) {
    toast({
      title: "API Key Missing",
      description: "Please configure your RapidAPI key in settings",
      variant: "destructive",
    });
    return [];
  }

  try {
    const response = await fetch(`https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=${symbols.join(',')}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': key,
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
};

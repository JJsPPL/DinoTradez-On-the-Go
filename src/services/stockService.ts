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

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  try {
    console.log('Fetching stock quotes for symbols:', symbols.join(','));
    
    // In development, consider using mock data
    if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_MOCK === 'true') {
      console.log('Using mock data for development');
      return symbols.map(symbol => createMockStockQuote(symbol));
    }
    
    // Prepare the API URL
    const response = await fetch(`/api/stock-data?symbols=${symbols.join(',')}`);

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Check if data has the expected structure
    if (!data || !Array.isArray(data.quoteResponse?.result)) {
      console.error('Unexpected API response structure:', data);
      
      // If there's an error message in the response, display it
      if (data.message) {
        toast(`API Error: ${data.message}`);
      }
      
      throw new Error('Invalid API response format');
    }

    return data.quoteResponse.result.map((item: any) => ({
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
    
    // Show a more detailed error message
    toast(`Failed to fetch stock data: ${error instanceof Error ? error.message : "Unknown error"}. Please check your network connection or API key.`);
    
    // Return empty array so the app doesn't crash
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

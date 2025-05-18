
import { toast } from 'sonner';

// Interface for news items
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  relatedSymbols?: string[];
}

// Direct API endpoint for Yahoo Finance News
const YAHOO_NEWS_API = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/ne/news';
const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

/**
 * Fetches market news directly from RapidAPI
 */
export const fetchMarketNews = async (): Promise<NewsItem[]> => {
  try {
    // Always use mock data when testing in development
    if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_MOCK === 'true') {
      console.log('Using mock news data for development');
      return createMockNewsData();
    }
    
    // In production, we'll fetch real data directly from the API
    try {
      const response = await fetch(YAHOO_NEWS_API, {
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
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      return data.map((article: any) => ({
        id: article.uuid || article.url || Math.random().toString(),
        title: article.title,
        summary: article.summary || article.description || '',
        url: article.link,
        source: article.publisher || 'Yahoo Finance',
        publishedAt: new Date(article.providerPublishTime * 1000 || Date.now()),
        relatedSymbols: article.relatedTickers || []
      }));
    } catch (error) {
      console.error('Error fetching from news API:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock news data due to API error');
      return createMockNewsData();
    }
  } catch (error) {
    console.error('Error fetching market news:', error);
    toast(`Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}. Using backup data.`);
    return createMockNewsData();
  }
};

/**
 * Creates mock news data for development and fallbacks
 */
const createMockNewsData = (): NewsItem[] => {
  return [
    {
      id: '1',
      title: 'Markets Rally on Fed Decision',
      summary: 'Major indices closed higher after the Federal Reserve announced its latest interest rate decision.',
      url: 'https://example.com/news/1',
      source: 'Market Daily',
      publishedAt: new Date(),
      relatedSymbols: ['^GSPC', '^DJI', '^IXIC']
    },
    {
      id: '2',
      title: 'Tech Stocks Lead the Way',
      summary: 'Technology sector continues to outperform as earnings reports exceed expectations.',
      url: 'https://example.com/news/2',
      source: 'Tech Insider',
      publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
      relatedSymbols: ['AAPL', 'MSFT', 'GOOGL']
    },
    {
      id: '3',
      title: 'Energy Sector Faces Challenges',
      summary: 'Oil prices decline amid concerns about global demand and increasing supply.',
      url: 'https://example.com/news/3',
      source: 'Energy Report',
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
      relatedSymbols: ['XOM', 'CVX', 'BP']
    },
    {
      id: '4',
      title: 'Crypto Market Update',
      summary: 'Bitcoin and other cryptocurrencies show signs of recovery after recent volatility.',
      url: 'https://example.com/news/4',
      source: 'Crypto Daily',
      publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
      relatedSymbols: ['BTC-USD', 'ETH-USD']
    },
    {
      id: '5',
      title: 'Retail Sales Data Surprises Analysts',
      summary: 'Latest economic indicators show stronger than expected consumer spending.',
      url: 'https://example.com/news/5',
      source: 'Economic Times',
      publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
      relatedSymbols: ['WMT', 'TGT', 'AMZN']
    }
  ];
};

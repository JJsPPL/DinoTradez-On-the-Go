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

// Finnhub.io API configuration
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// RapidAPI configuration (optional fallback)
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'yahoo-finance15.p.rapidapi.com';
const YAHOO_NEWS_API = `https://${RAPIDAPI_HOST}/api/v1/markets/news`;

/**
 * NewsService class - Handles fetching current news data
 */
export class NewsService {
  /**
   * Fetch recent financial news with fallback to mock data
   * @param symbols Optional array of stock symbols to filter by
   * @returns Array of news items
   */
  async getLatestNews(symbols?: string[]): Promise<NewsItem[]> {
    try {
      // Always use mock data when testing in development
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
        console.log('Using mock news data for development');
        return this.getMockNews(symbols);
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

        const newsItems = data.map((article: any) => ({
          id: article.uuid || article.url || Math.random().toString(),
          title: article.title,
          summary: article.summary || article.description || '',
          url: article.link,
          source: article.publisher || 'Yahoo Finance',
          publishedAt: new Date(article.providerPublishTime * 1000 || Date.now()),
          relatedSymbols: article.relatedTickers || []
        }));

        // Filter by symbols if provided
        if (symbols && symbols.length > 0) {
          return newsItems.filter((news: NewsItem) =>
            news.relatedSymbols && news.relatedSymbols.some(symbol => symbols.includes(symbol))
          );
        }

        return newsItems;
      } catch (error) {
        console.error('Error fetching from news API:', error);
        // Fall back to mock data on error
        console.log('Falling back to mock news data due to API error');
        return this.getMockNews(symbols);
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
      toast(`Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}. Using backup data.`);
      return this.getMockNews(symbols);
    }
  }

  /**
   * Creates mock news data for development and fallbacks
   * Made public to fix TypeScript error with legacy functions
   */
  getMockNews(symbols?: string[]): NewsItem[] {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    const mockNews: NewsItem[] = [
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
        publishedAt: fourHoursAgo,
        relatedSymbols: ['WMT', 'TGT', 'AMZN']
      },
      {
        id: '6',
        title: 'Federal Reserve Signals Possible Rate Cut',
        summary: 'Central bank officials hint at easing monetary policy amid inflation cooldown.',
        url: 'https://example.com/news/6',
        source: 'Financial Post',
        publishedAt: now,
        relatedSymbols: ['JPM', 'GS', 'MS']
      },
      {
        id: '7',
        title: 'Tech Sector Rally Continues on AI Advancements',
        summary: 'Semiconductor and cloud computing stocks lead market gains on AI breakthroughs.',
        url: 'https://example.com/news/7',
        source: 'Tech Insider',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        relatedSymbols: ['NVDA', 'AMD', 'INTC', 'MSFT']
      }
    ];

    // Filter by symbols if provided
    if (symbols && symbols.length > 0) {
      return mockNews.filter(news =>
        news.relatedSymbols && news.relatedSymbols.some(symbol => symbols.includes(symbol))
      );
    }

    return mockNews;
  }
}

// Legacy function for backward compatibility
export const fetchMarketNews = async (symbols?: string[]): Promise<NewsItem[]> => {
  const newsService = new NewsService();
  return await newsService.getLatestNews(symbols);
};

// Legacy function for backward compatibility
export const createMockNewsData = (): NewsItem[] => {
  return new NewsService().getMockNews();
};

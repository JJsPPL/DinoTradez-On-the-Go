
// Types for news data
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: Date | string;
  relatedSymbols: string[];
}

export class NewsService {
  /**
   * Fetch recent financial news
   * @param symbols Optional array of stock symbols to filter by
   * @returns Promise with array of news items
   */
  async getLatestNews(symbols?: string[]): Promise<NewsItem[]> {
    try {
      // Try to fetch news from our API endpoint
      const response = await fetch('/api/market-news');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.articles)) {
        throw new Error('Invalid API response format');
      }
      
      const news = data.articles.map((item: any) => ({
        id: item.id || item.url || Math.random().toString(),
        title: item.title,
        summary: item.summary || item.description || '',
        url: item.url,
        source: {
          name: item.source?.name || 'Financial News'
        },
        publishedAt: new Date(item.publishedAt),
        relatedSymbols: item.relatedSymbols || []
      }));
      
      // Filter by symbols if provided
      if (symbols && symbols.length > 0) {
        return news.filter(item => 
          item.relatedSymbols.some(symbol => symbols.includes(symbol))
        );
      }
      
      return news;
    } catch (error) {
      console.error('Error fetching market news:', error);
      // Fallback to mock news
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
        source: {
          name: 'Market Daily'
        },
        publishedAt: new Date(),
        relatedSymbols: ['^GSPC', '^DJI', '^IXIC']
      },
      {
        id: '2',
        title: 'Tech Stocks Lead the Way',
        summary: 'Technology sector continues to outperform as earnings reports exceed expectations.',
        url: 'https://example.com/news/2',
        source: {
          name: 'Tech Insider'
        },
        publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
        relatedSymbols: ['AAPL', 'MSFT', 'GOOGL']
      },
      {
        id: '3',
        title: 'Energy Sector Faces Challenges',
        summary: 'Oil prices decline amid concerns about global demand and increasing supply.',
        url: 'https://example.com/news/3',
        source: {
          name: 'Energy Report'
        },
        publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
        relatedSymbols: ['XOM', 'CVX', 'BP']
      },
      {
        id: '4',
        title: 'Crypto Market Update',
        summary: 'Bitcoin and other cryptocurrencies show signs of recovery after recent volatility.',
        url: 'https://example.com/news/4',
        source: {
          name: 'Crypto Daily'
        },
        publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
        relatedSymbols: ['BTC-USD', 'ETH-USD']
      },
      {
        id: '5',
        title: 'Retail Sales Data Surprises Analysts',
        summary: 'Latest economic indicators show stronger than expected consumer spending.',
        url: 'https://example.com/news/5',
        source: {
          name: 'Economic Times'
        },
        publishedAt: fourHoursAgo,
        relatedSymbols: ['WMT', 'TGT', 'AMZN']
      }
    ];
    
    // Filter by symbols if provided
    if (symbols && symbols.length > 0) {
      return mockNews.filter(news => 
        news.relatedSymbols.some(symbol => symbols.includes(symbol))
      );
    }
    
    return mockNews;
  }
}

// Legacy function for backward compatibility
export const createMockNewsData = (): NewsItem[] => {
  // This is a synchronous function that should return an array, not a promise
  // Create a new instance and use the now-public getMockNews method directly
  return new NewsService().getMockNews();
};

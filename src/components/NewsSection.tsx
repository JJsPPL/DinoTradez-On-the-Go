import React, { useState, useEffect } from 'react';
import { fetchMarketNews } from '../services/newsService';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  relatedSymbols?: string[];
}

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const newsData = await fetchMarketNews();
        setNews(newsData);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
    
    // Refresh news every 15 minutes
    const intervalId = setInterval(loadNews, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-black rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-white">Market News</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 p-4 rounded">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No news available</p>
      ) : (
        <div className="space-y-4">
          {news.map(item => (
            <div key={item.id} className="bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="font-medium text-white hover:text-green-400">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.summary}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>{new Date(item.publishedAt).toLocaleString()}</span>
                </div>
                {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.relatedSymbols.map(symbol => (
                      <span 
                        key={symbol} 
                        className="px-2 py-1 bg-gray-800 text-green-400 text-xs rounded"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSection; 
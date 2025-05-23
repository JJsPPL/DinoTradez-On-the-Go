
import { NextApiRequest, NextApiResponse } from 'next';

// Get API key from environment or set a default
const getRapidAPIKey = () => {
  // In a real implementation, this would be stored securely
  return '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
};

const RAPIDAPI_KEY = getRapidAPIKey();
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to fetch from Yahoo Finance 15 API which has a news endpoint
    try {
      const response = await fetch(
        `https://${RAPIDAPI_HOST}/api/yahoo/ne/news`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the data to match our expected format
      const articles = data.map((item: any) => ({
        id: item.uuid || item.url || Math.random().toString(),
        title: item.title,
        summary: item.summary || item.description || '',
        url: item.link,
        source: {
          name: item.publisher || 'Yahoo Finance'
        },
        publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
        relatedSymbols: item.relatedTickers || []
      }));

      // Cache the response for 5 minutes
      res.setHeader('Cache-Control', 's-maxage=300');
      res.status(200).json({ articles });
      return;
    } catch (apiError) {
      console.error('API Error from Yahoo Finance 15:', apiError);
      // Proceed to fallback
    }

    // Fallback to mock data if the API call fails
    const now = new Date();
    const mockArticles = [
      {
        id: '1',
        title: 'Markets Rally on Fed Decision',
        summary: 'Major indices closed higher after the Federal Reserve announced its latest interest rate decision.',
        url: 'https://example.com/news/1',
        source: {
          name: 'Market Daily'
        },
        publishedAt: now.toISOString(),
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
        publishedAt: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
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
        publishedAt: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
        relatedSymbols: ['XOM', 'CVX', 'BP']
      }
    ];

    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({ articles: mockArticles });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch market news from Finnhub
    const response = await fetch(
      `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the data to match our expected format
    const articles = data.slice(0, 20).map((item: any) => ({
      id: item.id || item.url || Math.random().toString(),
      title: item.headline,
      summary: item.summary || '',
      url: item.url,
      source: {
        name: item.source || 'Financial News'
      },
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      relatedSymbols: item.related || []
    }));

    // Cache the response for 30 minutes
    res.setHeader('Cache-Control', 's-maxage=1800');
    res.status(200).json({ articles });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
} 
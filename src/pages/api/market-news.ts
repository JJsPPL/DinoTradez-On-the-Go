import { NextApiRequest, NextApiResponse } from 'next';

const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch market news from Yahoo Finance
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
      id: item.uuid || item.url,
      title: item.title,
      summary: item.summary || item.description || '',
      url: item.link,
      source: {
        name: item.publisher || 'Yahoo Finance'
      },
      publishedAt: item.providerPublishTime || new Date().toISOString(),
      relatedSymbols: item.relatedTickers || []
    }));

    // Cache the response for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({ articles });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
} 
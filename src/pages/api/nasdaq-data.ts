import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    const symbolArray = Array.isArray(symbols) ? symbols : symbols.toString().split(',');
    
    // Fetch current stock quotes from Finnhub for NASDAQ symbols
    const quotePromises = symbolArray.map(async (symbol) => {
      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Finnhub API responded with status: ${response.status}`);
        }

        const quoteData = await response.json();
        
        // Also fetch company profile for additional info
        const profileResponse = await fetch(
          `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        
        let profileData = {};
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }

        return {
          symbol: symbol,
          regularMarketPrice: quoteData.c || 0,
          regularMarketChange: quoteData.d || 0,
          regularMarketChangePercent: quoteData.dp || 0,
          regularMarketTime: Math.floor(Date.now() / 1000),
          shortName: profileData.name || symbol,
          longName: profileData.finnhubIndustry || profileData.name || symbol
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Return fallback data
        return {
          symbol: symbol,
          regularMarketPrice: 0,
          regularMarketChange: 0,
          regularMarketChangePercent: 0,
          regularMarketTime: Math.floor(Date.now() / 1000),
          shortName: symbol,
          longName: symbol
        };
      }
    });

    const results = await Promise.all(quotePromises);
    
    // Format response to match expected structure
    const formattedData = {
      quoteResponse: {
        result: results
      }
    };

    res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch NASDAQ stock data' });
  }
} 
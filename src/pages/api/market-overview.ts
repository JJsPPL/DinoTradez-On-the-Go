import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Major indices to track
    const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
    
    // Fetch current quotes for major indices
    const indexPromises = indices.map(async (symbol) => {
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
        
        return {
          symbol: symbol,
          regularMarketPrice: quoteData.c || 0,
          regularMarketChange: quoteData.d || 0,
          regularMarketChangePercent: quoteData.dp || 0,
          regularMarketTime: Math.floor(Date.now() / 1000),
          shortName: getIndexName(symbol),
          longName: getIndexFullName(symbol)
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return {
          symbol: symbol,
          regularMarketPrice: 0,
          regularMarketChange: 0,
          regularMarketChangePercent: 0,
          regularMarketTime: Math.floor(Date.now() / 1000),
          shortName: getIndexName(symbol),
          longName: getIndexFullName(symbol)
        };
      }
    });

    // Fetch market movers (gainers and losers)
    const moversResponse = await fetch(
      `${FINNHUB_BASE_URL}/stock/us?exchange=US&token=${FINNHUB_API_KEY}`
    );
    
    let trendingStocks = [];
    if (moversResponse.ok) {
      const moversData = await moversResponse.json();
      trendingStocks = moversData.slice(0, 10).map((stock: any) => ({
        symbol: stock.symbol,
        regularMarketPrice: stock.price || 0,
        regularMarketChange: stock.change || 0,
        regularMarketChangePercent: stock.changePercent || 0,
        regularMarketTime: Math.floor(Date.now() / 1000),
        shortName: stock.description || stock.symbol,
        longName: stock.description || stock.symbol
      }));
    }

    const indexResults = await Promise.all(indexPromises);
    
    // Format response to match expected structure
    const formattedData = {
      marketSummaryResponse: {
        result: indexResults
      },
      finance: {
        result: [{
          quotes: trendingStocks
        }]
      }
    };

    res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch market overview data' });
  }
}

// Helper functions to get index names
function getIndexName(symbol: string): string {
  const names: { [key: string]: string } = {
    '^GSPC': 'S&P 500',
    '^DJI': 'Dow Jones',
    '^IXIC': 'NASDAQ',
    '^RUT': 'Russell 2000',
    '^VIX': 'VIX'
  };
  return names[symbol] || symbol;
}

function getIndexFullName(symbol: string): string {
  const names: { [key: string]: string } = {
    '^GSPC': 'S&P 500 Index',
    '^DJI': 'Dow Jones Industrial Average',
    '^IXIC': 'NASDAQ Composite',
    '^RUT': 'Russell 2000 Index',
    '^VIX': 'CBOE Volatility Index'
  };
  return names[symbol] || symbol;
} 
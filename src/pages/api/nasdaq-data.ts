import { NextApiRequest, NextApiResponse } from 'next';

const RAPIDAPI_KEY = '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee';
const RAPIDAPI_HOST = 'yahoo-finance127.p.rapidapi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    // Try to use the MCP NASDAQ data server if available
    try {
      const mcpResponse = await fetch('http://localhost:7001/api/stock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: Array.isArray(symbols) ? symbols : symbols.toString().split(','),
          exchange: 'NASDAQ'
        }),
        // Short timeout to fail fast if MCP server is not available
        signal: AbortSignal.timeout(2000)
      });
      
      if (mcpResponse.ok) {
        const mcpData = await mcpResponse.json();
        console.log('Using MCP NASDAQ data service');
        
        res.setHeader('Cache-Control', 's-maxage=10');
        return res.status(200).json({
          quoteResponse: {
            result: mcpData.data.map((item: any) => ({
              symbol: item.symbol,
              regularMarketPrice: item.price,
              regularMarketChange: item.change,
              regularMarketChangePercent: item.changePercent,
              regularMarketTime: Math.floor(Date.now() / 1000),
              shortName: item.name,
              longName: item.fullName
            }))
          }
        });
      }
    } catch (mcpError) {
      console.warn('MCP NASDAQ server unavailable, falling back to RapidAPI:', mcpError);
    }

    // Fallback to RapidAPI
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/finance/quote?symbols=${symbols}`,
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
    res.setHeader('Cache-Control', 's-maxage=10');
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch NASDAQ stock data' });
  }
} 
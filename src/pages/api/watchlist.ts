import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  if (!type || (type !== 'bullish' && type !== 'bearish')) {
    return res.status(400).json({ error: 'Type parameter must be "bullish" or "bearish"' });
  }

  try {
    // Original watchlist stocks (preserving successful logic)
    const bullishStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'ADBE', 'CRM',
      'PYPL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'MU', 'AMAT', 'KLAC', 'LRCX'
    ];
    
    const bearishStocks = [
      'XOM', 'CVX', 'COP', 'EOG', 'PXD', 'SLB', 'HAL', 'BKR', 'NOV', 'FTI',
      'WFT', 'CHK', 'DVN', 'APA', 'MRO', 'KMI', 'PSX', 'VLO', 'MPC', 'HES'
    ];
    
    const watchlistStocks = type === 'bullish' ? bullishStocks : bearishStocks;
    
    // Fetch current data for watchlist stocks
    const watchlistPromises = watchlistStocks.map(async (symbol) => {
      try {
        // Fetch current quote
        const quoteResponse = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Fetch company profile
        const profileResponse = await fetch(
          `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        
        // Fetch institutional sentiment
        const sentimentResponse = await fetch(
          `${FINNHUB_BASE_URL}/stock/institutional-sentiment?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );

        let quoteData = {};
        let profileData = {};
        let sentimentData = { bullish: 0, bearish: 0 };
        
        if (quoteResponse.ok) {
          quoteData = await quoteResponse.json();
        }
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }
        
        if (sentimentResponse.ok) {
          const sentiment = await sentimentResponse.json();
          sentimentData = {
            bullish: sentiment.bullish || 0,
            bearish: sentiment.bearish || 0
          };
        }

        const currentPrice = quoteData.c || 0;
        const priceChange = quoteData.d || 0;
        const priceChangePercent = quoteData.dp || 0;
        const volume = quoteData.v || 0;
        
        // Calculate watchlist score based on type
        let watchlistScore = 0;
        
        if (type === 'bullish') {
          // Bullish scoring: positive momentum, high volume, institutional buying
          if (priceChangePercent > 2) watchlistScore += 30;
          else if (priceChangePercent > 0) watchlistScore += 20;
          
          if (volume > 5000000) watchlistScore += 25;
          else if (volume > 2000000) watchlistScore += 15;
          
          if (sentimentData.bullish > sentimentData.bearish) watchlistScore += 25;
          else if (sentimentData.bullish > 0) watchlistScore += 15;
          
          if (currentPrice > 100) watchlistScore += 20;
          else if (currentPrice > 50) watchlistScore += 15;
          else if (currentPrice > 20) watchlistScore += 10;
        } else {
          // Bearish scoring: negative momentum, high volume, institutional selling
          if (priceChangePercent < -2) watchlistScore += 30;
          else if (priceChangePercent < 0) watchlistScore += 20;
          
          if (volume > 5000000) watchlistScore += 25;
          else if (volume > 2000000) watchlistScore += 15;
          
          if (sentimentData.bearish > sentimentData.bullish) watchlistScore += 25;
          else if (sentimentData.bearish > 0) watchlistScore += 15;
          
          if (currentPrice < 20) watchlistScore += 20;
          else if (currentPrice < 50) watchlistScore += 15;
          else if (currentPrice < 100) watchlistScore += 10;
        }

        return {
          symbol: symbol,
          companyName: profileData.name || symbol,
          currentPrice: currentPrice,
          priceChange: priceChange,
          priceChangePercent: priceChangePercent,
          volume: volume,
          watchlistScore: watchlistScore,
          sentiment: sentimentData,
          sector: profileData.finnhubIndustry || (type === 'bullish' ? 'Technology' : 'Energy'),
          marketCap: profileData.marketCapitalization || 0,
          lastUpdated: new Date().toISOString(),
          watchlistType: type
        };
      } catch (error) {
        console.error(`Error fetching watchlist data for ${symbol}:`, error);
        return {
          symbol: symbol,
          companyName: symbol,
          currentPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          volume: 0,
          watchlistScore: 0,
          sentiment: { bullish: 0, bearish: 0 },
          sector: type === 'bullish' ? 'Technology' : 'Energy',
          marketCap: 0,
          lastUpdated: new Date().toISOString(),
          watchlistType: type
        };
      }
    });

    const watchlistResults = await Promise.all(watchlistPromises);
    
    // Sort by watchlist score (highest first)
    const sortedResults = watchlistResults.sort((a, b) => b.watchlistScore - a.watchlistScore);
    
    // Get top 15 picks
    const topPicks = sortedResults.slice(0, 15);

    res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
    res.status(200).json({ 
      watchlist: topPicks,
      type: type,
      summary: {
        totalStocks: topPicks.length,
        averageScore: topPicks.reduce((sum, item) => sum + item.watchlistScore, 0) / topPicks.length,
        averagePriceChange: topPicks.reduce((sum, item) => sum + item.priceChangePercent, 0) / topPicks.length,
        totalVolume: topPicks.reduce((sum, item) => sum + item.volume, 0)
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist data' });
  }
} 
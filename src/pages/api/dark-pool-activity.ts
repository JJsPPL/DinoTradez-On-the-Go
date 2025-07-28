import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For dark pool activity, we'll fetch institutional sentiment and unusual volume
    // Note: Finnhub's free tier has limited institutional data, so we'll use available endpoints
    
    // Fetch institutional sentiment for major stocks
    const majorStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
    
    const darkPoolPromises = majorStocks.map(async (symbol) => {
      try {
        // Fetch institutional sentiment
        const sentimentResponse = await fetch(
          `${FINNHUB_BASE_URL}/stock/institutional-sentiment?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        
        // Fetch company profile for additional info
        const profileResponse = await fetch(
          `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        
        let sentimentData = { bullish: 0, bearish: 0 };
        let profileData = {};
        
        if (sentimentResponse.ok) {
          const sentiment = await sentimentResponse.json();
          sentimentData = {
            bullish: sentiment.bullish || 0,
            bearish: sentiment.bearish || 0
          };
        }
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }
        
        // Calculate dark pool activity score (simplified)
        const totalSentiment = sentimentData.bullish + sentimentData.bearish;
        const darkPoolScore = totalSentiment > 0 ? (sentimentData.bullish / totalSentiment) * 100 : 50;
        
        return {
          symbol: symbol,
          companyName: profileData.name || symbol,
          regularVolume: Math.floor(Math.random() * 10000000) + 1000000, // Mock volume
          darkPoolVolume: Math.floor(darkPoolScore * 10000), // Estimated dark pool volume
          darkPoolPercentage: Math.min(darkPoolScore, 95), // Cap at 95%
          institutionalSentiment: sentimentData,
          lastUpdated: new Date().toISOString(),
          anomaly: darkPoolScore > 70 || darkPoolScore < 30 // Flag unusual activity
        };
      } catch (error) {
        console.error(`Error fetching dark pool data for ${symbol}:`, error);
        return {
          symbol: symbol,
          companyName: symbol,
          regularVolume: 0,
          darkPoolVolume: 0,
          darkPoolPercentage: 0,
          institutionalSentiment: { bullish: 0, bearish: 0 },
          lastUpdated: new Date().toISOString(),
          anomaly: false
        };
      }
    });

    const darkPoolResults = await Promise.all(darkPoolPromises);
    
    // Sort by dark pool percentage (highest first)
    const sortedResults = darkPoolResults.sort((a, b) => b.darkPoolPercentage - a.darkPoolPercentage);

    res.setHeader('Cache-Control', 's-maxage=600'); // Cache for 10 minutes
    res.status(200).json({ 
      darkPoolActivity: sortedResults,
      summary: {
        totalStocks: sortedResults.length,
        averageDarkPoolPercentage: sortedResults.reduce((sum, item) => sum + item.darkPoolPercentage, 0) / sortedResults.length,
        anomalies: sortedResults.filter(item => item.anomaly).length
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch dark pool activity data' });
  }
} 
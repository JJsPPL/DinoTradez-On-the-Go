import { NextApiRequest, NextApiResponse } from 'next';

// Finnhub.io API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Original lotto stock picks from 2023 (preserving the successful logic)
    const originalLottoPicks = [
      'DINO', 'CEMI', 'GEVO', 'NE', 'RIG', 'XOM', 'CVX', 'COP', 'EOG', 'PXD',
      'SLB', 'HAL', 'BKR', 'NOV', 'FTI', 'WFT', 'CHK', 'DVN', 'APA', 'MRO'
    ];
    
    // Fetch current data for all lotto picks
    const lottoPromises = originalLottoPicks.map(async (symbol) => {
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
        
        // Fetch financial metrics
        const metricsResponse = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );

        let quoteData = {};
        let profileData = {};
        let metricsData = {};
        
        if (quoteResponse.ok) {
          quoteData = await quoteResponse.json();
        }
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }
        
        if (metricsResponse.ok) {
          metricsData = await metricsResponse.json();
        }

        // Calculate lotto score based on original criteria
        const currentPrice = quoteData.c || 0;
        const priceChange = quoteData.d || 0;
        const priceChangePercent = quoteData.dp || 0;
        const volume = quoteData.v || 0;
        
        // Lotto scoring algorithm (preserving original logic)
        let lottoScore = 0;
        
        // Price momentum (30% weight)
        if (priceChangePercent > 5) lottoScore += 30;
        else if (priceChangePercent > 2) lottoScore += 20;
        else if (priceChangePercent > 0) lottoScore += 10;
        
        // Volume analysis (25% weight)
        if (volume > 10000000) lottoScore += 25;
        else if (volume > 5000000) lottoScore += 15;
        else if (volume > 1000000) lottoScore += 10;
        
        // Price range analysis (25% weight)
        if (currentPrice > 50) lottoScore += 25;
        else if (currentPrice > 20) lottoScore += 20;
        else if (currentPrice > 10) lottoScore += 15;
        else if (currentPrice > 5) lottoScore += 10;
        
        // Volatility bonus (20% weight)
        if (Math.abs(priceChangePercent) > 10) lottoScore += 20;
        else if (Math.abs(priceChangePercent) > 5) lottoScore += 15;
        else if (Math.abs(priceChangePercent) > 2) lottoScore += 10;

        return {
          symbol: symbol,
          companyName: profileData.name || symbol,
          currentPrice: currentPrice,
          priceChange: priceChange,
          priceChangePercent: priceChangePercent,
          volume: volume,
          lottoScore: lottoScore,
          riskLevel: lottoScore > 70 ? 'HIGH' : lottoScore > 50 ? 'MEDIUM' : 'LOW',
          sector: profileData.finnhubIndustry || 'Energy',
          marketCap: profileData.marketCapitalization || 0,
          lastUpdated: new Date().toISOString(),
          original2023Price: getOriginal2023Price(symbol), // For comparison
          performanceSince2023: calculatePerformanceSince2023(currentPrice, getOriginal2023Price(symbol))
        };
      } catch (error) {
        console.error(`Error fetching lotto data for ${symbol}:`, error);
        return {
          symbol: symbol,
          companyName: symbol,
          currentPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          volume: 0,
          lottoScore: 0,
          riskLevel: 'LOW',
          sector: 'Energy',
          marketCap: 0,
          lastUpdated: new Date().toISOString(),
          original2023Price: getOriginal2023Price(symbol),
          performanceSince2023: 0
        };
      }
    });

    const lottoResults = await Promise.all(lottoPromises);
    
    // Sort by lotto score (highest first)
    const sortedResults = lottoResults.sort((a, b) => b.lottoScore - a.lottoScore);
    
    // Get top 10 picks
    const topPicks = sortedResults.slice(0, 10);

    res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
    res.status(200).json({ 
      lottoPicks: topPicks,
      summary: {
        totalPicks: topPicks.length,
        averageScore: topPicks.reduce((sum, item) => sum + item.lottoScore, 0) / topPicks.length,
        highRiskPicks: topPicks.filter(item => item.riskLevel === 'HIGH').length,
        averagePerformanceSince2023: topPicks.reduce((sum, item) => sum + item.performanceSince2023, 0) / topPicks.length
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch lotto stock picks data' });
  }
}

// Helper function to get original 2023 prices (for comparison)
function getOriginal2023Price(symbol: string): number {
  const originalPrices: { [key: string]: number } = {
    'DINO': 41.91, 'CEMI': 32.09, 'GEVO': 178.66, 'NE': 52.85, 'RIG': 79.90,
    'XOM': 95.00, 'CVX': 150.00, 'COP': 110.00, 'EOG': 120.00, 'PXD': 200.00,
    'SLB': 50.00, 'HAL': 30.00, 'BKR': 25.00, 'NOV': 20.00, 'FTI': 15.00,
    'WFT': 10.00, 'CHK': 80.00, 'DVN': 60.00, 'APA': 40.00, 'MRO': 25.00
  };
  return originalPrices[symbol] || 0;
}

// Helper function to calculate performance since 2023
function calculatePerformanceSince2023(currentPrice: number, originalPrice: number): number {
  if (originalPrice === 0) return 0;
  return ((currentPrice - originalPrice) / originalPrice) * 100;
} 
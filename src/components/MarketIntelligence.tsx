
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { CheckedState } from '@radix-ui/react-checkbox';

interface S3Filing {
  id: string;
  company: string;
  ticker: string;
  filingType: string;
  date: string;
}

interface ShortInterestData {
  symbol: string;
  shortPercentage: number;
  change: number;
  volume: string;
}

interface MarketIndexData {
  name: string;
  value: string;
  change: number;
  changePercent: number;
  isNegative: boolean;
}

const MarketIntelligence = () => {
  // Mock data for S-3 Offerings
  const s3Offerings: S3Filing[] = [
    { id: '1', company: 'Palantir Technologies Inc', ticker: 'PLTR', filingType: 'S-3ASR', date: '2025-04-10' },
    { id: '2', company: 'SoFi Technologies, Inc.', ticker: 'SOFI', filingType: 'S-3', date: '2025-04-09' },
    { id: '3', company: 'Lucid Group, Inc.', ticker: 'LCID', filingType: 'S-3ASR', date: '2025-04-08' },
    { id: '4', company: 'Rivian Automotive, Inc.', ticker: 'RIVN', filingType: 'S-3', date: '2025-04-07' },
    { id: '5', company: 'Beyond Meat, Inc.', ticker: 'BYND', filingType: 'S-3', date: '2025-04-05' },
  ];

  // Mock data for Short Interest
  const shortInterestData: ShortInterestData[] = [
    { symbol: 'BBBY', shortPercentage: 30.02, change: -93.14, volume: '10.5M' },
    { symbol: 'CVNA', shortPercentage: 18.82, change: -98.65, volume: '6.2M' },
    { symbol: 'SNDL', shortPercentage: 16.73, change: -94.78, volume: '9.8M' },
  ];

  // Market overview data including new assets
  const marketIndices: MarketIndexData[] = [
    { name: 'S&P 500', value: '4,993.48', change: 23.92, changePercent: 0.48, isNegative: false },
    { name: 'Nasdaq', value: '15,929.20', change: 31.66, changePercent: 0.20, isNegative: false },
    { name: 'Dow Jones', value: '39,220.58', change: 191.34, changePercent: 0.49, isNegative: false },
    { name: 'Russell 2000', value: '2,026.14', change: -7.38, changePercent: -0.36, isNegative: true },
    { name: 'Bitcoin', value: '63,755.82', change: 1258.42, changePercent: 2.01, isNegative: false },
    { name: 'Gold', value: '2,345.90', change: 12.75, changePercent: 0.55, isNegative: false },
    { name: '10-Year Treasury', value: '4.52%', change: 0.02, changePercent: 0.44, isNegative: false },
  ];

  const [showLottoPicks, setShowLottoPicks] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const handleLottoPicksChange = (checked: CheckedState) => {
    setShowLottoPicks(checked === true);
  };

  const handleVolumeChange = (checked: CheckedState) => {
    setShowVolume(checked === true);
  };

  return (
    <div className="space-y-10 py-8">
      {/* Market Overview Section */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient dino-gradient bg-clip-text text-transparent">
            Market Overview
          </h2>
          <p className="text-muted-foreground">
            Track major indices and trending stocks
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {marketIndices.map((index, i) => (
            <div 
              key={index.name} 
              className="glass-card p-4 rounded-lg transition-all hover:translate-y-[-3px] hover:shadow-lg"
            >
              <div className="flex flex-col space-y-2">
                <div className="text-lg font-medium text-muted-foreground">{index.name}</div>
                <div className="text-2xl font-bold">{index.value}</div>
                <div className={`flex items-center ${index.isNegative ? 'text-red-500' : 'text-green-500'}`}>
                  <span className="mr-1">
                    {index.isNegative ? '-' : '+'}{Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
                  </span>
                  {index.isNegative ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Market Intelligence Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient dino-gradient bg-clip-text text-transparent">
          Market Intelligence
        </h2>
        <p className="text-muted-foreground">
          Stay informed with critical market data
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* S-3 Offerings Section */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-black/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium">Latest S-3 Offerings</h3>
            <div className="ml-auto text-xs text-muted-foreground">Source: SEC Edgar</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {s3Offerings.map((filing) => (
              <div key={filing.id} className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div>
                  <div className="font-medium">{filing.company} ({filing.ticker})</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-teal-900/30 text-teal-400 border border-teal-800/40">
                    {filing.filingType}
                  </span>
                  <span className="text-sm text-muted-foreground">{filing.date}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 text-center">
            <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
              View All S-3 Filings →
            </Button>
          </div>
        </div>

        {/* Short Interest Section */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-black/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium">High Short Interest</h3>
            <div className="ml-auto text-xs text-muted-foreground">Source: FINRA (1M Volume)</div>
          </div>
          
          <div className="p-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="lotto-picks" checked={showLottoPicks} onCheckedChange={handleLottoPicksChange} />
              <label htmlFor="lotto-picks" className="text-sm">Show Lotto Picks (-90% to -99% change)</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="volume-only" checked={showVolume} onCheckedChange={handleVolumeChange} />
              <label htmlFor="volume-only" className="text-sm">1M Volume Only</label>
            </div>
          </div>
          
          <div className="px-3">
            <table className="w-full">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-right p-2">Short %</th>
                  <th className="text-right p-2">Change</th>
                  <th className="text-right p-2">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shortInterestData.map((item) => (
                  <tr key={item.symbol} className="hover:bg-white/5 transition-colors">
                    <td className="p-2 font-medium">{item.symbol}</td>
                    <td className="p-2 text-right text-amber-500">{item.shortPercentage.toFixed(2)}%</td>
                    <td className="p-2 text-right text-red-500">{item.change.toFixed(2)}%</td>
                    <td className="p-2 text-right">{item.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 text-center">
            <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
              View All Short Interest Data →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;

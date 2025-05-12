
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
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

interface DarkPoolData {
  symbol: string;
  dpPercentage: number;
  dpVolume: string;
  blockTrades: number;
}

interface LottoStockData {
  symbol: string;
  last: number;
  netChng: number;
  percentChange: number;
  shares: string;
  auth: string;
  marketCap: string;
  mcCe: number;
  volume: string;
  avgVol: string;
  relVol: number;
  dpPercentage: number;
}

interface WatchlistStockData {
  symbol: string;
  last: number;
  netChng: number;
  percentChange: number;
  shares: string;
  auth: string;
  marketCap: string;
  mcCe: number;
  volume: string;
  avgVol: string;
  relVol: number;
  dpPercentage: number;
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

  // Mock data for Dark Pool Activity
  const darkPoolData: DarkPoolData[] = [
    { symbol: 'TSLA', dpPercentage: 48.7, dpVolume: '57.73M', blockTrades: 127 },
    { symbol: 'AAPL', dpPercentage: 42.8, dpVolume: '23.94M', blockTrades: 87 },
    { symbol: 'AMZN', dpPercentage: 45.1, dpVolume: '21.57M', blockTrades: 93 },
    { symbol: 'NVDA', dpPercentage: 46.2, dpVolume: '20.11M', blockTrades: 76 },
    { symbol: 'GME', dpPercentage: 55.2, dpVolume: '3.94M', blockTrades: 29 },
  ];

  // Mock data for Lotto Stock Picks
  const lottoStockData: LottoStockData[] = [
    { 
      symbol: 'BBBY', 
      last: 0.48, 
      netChng: -5.36, 
      percentChange: -91.79, 
      shares: '119.0M', 
      auth: '900.0M', 
      marketCap: '57.12M', 
      mcCe: 0.28,
      volume: '10.52M',
      avgVol: '8.74M',
      relVol: 1.20,
      dpPercentage: 59.4
    },
    { 
      symbol: 'SNDL', 
      last: 0.63, 
      netChng: -11.37, 
      percentChange: -94.78, 
      shares: '261.7M', 
      auth: '2.0B', 
      marketCap: '164.9M', 
      mcCe: 0.54,
      volume: '9.8M',
      avgVol: '7.2M',
      relVol: 1.36,
      dpPercentage: 47.2
    },
    { 
      symbol: 'CVNA', 
      last: 9.46, 
      netChng: -104.52, 
      percentChange: -91.70, 
      shares: '105.4M', 
      auth: '500.0M', 
      marketCap: '997.9M', 
      mcCe: 0.87,
      volume: '6.2M',
      avgVol: '5.9M',
      relVol: 1.05,
      dpPercentage: 52.1
    }
  ];

  // Mock data for Bullish Watchlist
  const bullishWatchlistData: WatchlistStockData[] = [
    { 
      symbol: 'AAPL', 
      last: 176.04, 
      netChng: 3.39, 
      percentChange: 1.93, 
      shares: '15.7B', 
      auth: '50.0B', 
      marketCap: '2.74T', 
      mcCe: 28.65,
      volume: '55.92M',
      avgVol: '61.54M',
      relVol: 0.91,
      dpPercentage: 42.8
    },
    { 
      symbol: 'MSFT', 
      last: 314.62, 
      netChng: 6.40, 
      percentChange: 2.05, 
      shares: '7.43B', 
      auth: '24.0B', 
      marketCap: '2.31T', 
      mcCe: 12.43,
      volume: '23.79M',
      avgVol: '26.18M',
      relVol: 0.91,
      dpPercentage: 38.5
    },
    { 
      symbol: 'NVDA', 
      last: 681.83, 
      netChng: 11.33, 
      percentChange: 1.66, 
      shares: '2.47B', 
      auth: '4.0B', 
      marketCap: '1.68T', 
      mcCe: 51.24,
      volume: '43.52M',
      avgVol: '47.89M',
      relVol: 0.91,
      dpPercentage: 46.2
    }
  ];

  // Mock data for Bearish Watchlist
  const bearishWatchlistData: WatchlistStockData[] = [
    { 
      symbol: 'INTC', 
      last: 35.57, 
      netChng: 1.65, 
      percentChange: 4.37, 
      shares: '4.21B', 
      auth: '10.0B', 
      marketCap: '150.17B', 
      mcCe: 3.24,
      volume: '52.63M',
      avgVol: '43.82M',
      relVol: 1.20,
      dpPercentage: 44.3
    },
    { 
      symbol: 'RIVN', 
      last: 10.23, 
      netChng: 0.79, 
      percentChange: 7.14, 
      shares: '948.3M', 
      auth: '4.5B', 
      marketCap: '9.74B', 
      mcCe: 1.36,
      volume: '35.28M',
      avgVol: '32.56M',
      relVol: 1.08,
      dpPercentage: 52.6
    },
    { 
      symbol: 'HOOD', 
      last: 16.76, 
      netChng: 1.18, 
      percentChange: 6.52, 
      shares: '729.5M', 
      auth: '2.5B', 
      marketCap: '12.27B', 
      mcCe: 2.14,
      volume: '18.24M',
      avgVol: '12.38M',
      relVol: 1.47,
      dpPercentage: 47.8
    }
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
      
      {/* Dark Pool Activity Section */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="text-center p-4 bg-black/30">
          <h2 className="text-2xl font-bold">Dark Pool Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Latest Dark Pool Data
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">DP %</TableHead>
              <TableHead className="text-right">DP Volume</TableHead>
              <TableHead className="text-right">Block Trades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {darkPoolData.map(item => (
              <TableRow key={item.symbol}>
                <TableCell className="font-medium text-green-500">{item.symbol}</TableCell>
                <TableCell className="text-right">{item.dpPercentage}%</TableCell>
                <TableCell className="text-right">{item.dpVolume}</TableCell>
                <TableCell className="text-right">{item.blockTrades}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="p-3 text-center">
          <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
            View All Dark Pool Data →
          </Button>
        </div>
      </div>
      
      {/* Lotto Stock Picks Section */}
      <div className="bg-teal-900/30 rounded-lg overflow-hidden">
        <div className="text-center p-4 bg-teal-900/50">
          <h2 className="text-2xl font-bold">Lotto Stock Picks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stocks with >1M volume and -90% to -99% change
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Last</TableHead>
                <TableHead className="text-right">Net Chng</TableHead>
                <TableHead className="text-right">%Change</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Auth</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">MC/CE</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Avg Vol</TableHead>
                <TableHead className="text-right">Rel Vol</TableHead>
                <TableHead className="text-right">DP %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lottoStockData.map(item => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium text-green-500">{item.symbol}</TableCell>
                  <TableCell className="text-right">{item.last.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-red-500">{item.netChng.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-red-500">{item.percentChange.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.shares}</TableCell>
                  <TableCell className="text-right">{item.auth}</TableCell>
                  <TableCell className="text-right">{item.marketCap}</TableCell>
                  <TableCell className="text-right">{item.mcCe.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.volume}</TableCell>
                  <TableCell className="text-right">{item.avgVol}</TableCell>
                  <TableCell className="text-right">{item.relVol.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.dpPercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      
      {/* Bullish Watchlist Section */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="text-center p-4 bg-black/30">
          <h2 className="text-2xl font-bold">Bullish Watchlist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stocks with high volume and positive momentum
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Last</TableHead>
                <TableHead className="text-right">Net Chng</TableHead>
                <TableHead className="text-right">%Change</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Auth</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">MC/CE</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Avg Vol</TableHead>
                <TableHead className="text-right">Rel Vol</TableHead>
                <TableHead className="text-right">DP %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bullishWatchlistData.map(item => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium text-green-500">{item.symbol}</TableCell>
                  <TableCell className="text-right">{item.last.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-500">+{item.netChng.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-500">+{item.percentChange.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.shares}</TableCell>
                  <TableCell className="text-right">{item.auth}</TableCell>
                  <TableCell className="text-right">{item.marketCap}</TableCell>
                  <TableCell className="text-right">{item.mcCe.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.volume}</TableCell>
                  <TableCell className="text-right">{item.avgVol}</TableCell>
                  <TableCell className="text-right">{item.relVol.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.dpPercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Bearish Watchlist Section */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="text-center p-4 bg-black/30">
          <h2 className="text-2xl font-bold">Bearish Watchlist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stocks with high volume and negative momentum
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Last</TableHead>
                <TableHead className="text-right">Net Chng</TableHead>
                <TableHead className="text-right">%Change</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Auth</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">MC/CE</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Avg Vol</TableHead>
                <TableHead className="text-right">Rel Vol</TableHead>
                <TableHead className="text-right">DP %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bearishWatchlistData.map(item => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium text-green-500">{item.symbol}</TableCell>
                  <TableCell className="text-right">{item.last.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-500">+{item.netChng.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-500">+{item.percentChange.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.shares}</TableCell>
                  <TableCell className="text-right">{item.auth}</TableCell>
                  <TableCell className="text-right">{item.marketCap}</TableCell>
                  <TableCell className="text-right">{item.mcCe.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.volume}</TableCell>
                  <TableCell className="text-right">{item.avgVol}</TableCell>
                  <TableCell className="text-right">{item.relVol.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.dpPercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;

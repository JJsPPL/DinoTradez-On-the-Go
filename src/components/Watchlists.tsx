
import React, { useState, useEffect } from 'react';
import { fetchStockQuotes, convertToWatchlistItems, defaultWatchlists, WatchlistItem } from '@/services/stockService';
import WatchlistTable from './WatchlistTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Watchlists = () => {
  const [activeTab, setActiveTab] = useState<string>('dinosaurThemed');
  const [watchlists, setWatchlists] = useState<Record<string, WatchlistItem[]>>({
    dinosaurThemed: [],
    technology: [],
    energy: [],
    marketOverview: [],
    lottoPicks: [],
    crypto: [],
    indices: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load watchlist data
  const loadWatchlists = async () => {
    setIsLoading(true);
    try {
      const symbols = defaultWatchlists[activeTab as keyof typeof defaultWatchlists];
      const quotes = await fetchStockQuotes(symbols);
      if (quotes.length > 0) {
        setWatchlists(prev => ({
          ...prev,
          [activeTab]: convertToWatchlistItems(quotes)
        }));
        setLastUpdated(new Date());
      }
      
      // Also load market overview data if not the active tab
      if (activeTab !== 'marketOverview') {
        const marketOverviewSymbols = defaultWatchlists.marketOverview;
        const marketOverviewQuotes = await fetchStockQuotes(marketOverviewSymbols);
        if (marketOverviewQuotes.length > 0) {
          setWatchlists(prev => ({
            ...prev,
            marketOverview: convertToWatchlistItems(marketOverviewQuotes)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    loadWatchlists();
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadWatchlists();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  // Mock price history data for visualization
  const mockPriceHistory = [
    { date: '2025-04-01', price: 125.3 },
    { date: '2025-04-02', price: 128.5 },
    { date: '2025-04-03', price: 130.2 },
    { date: '2025-04-04', price: 127.8 },
    { date: '2025-04-05', price: 129.4 },
    { date: '2025-04-06', price: 132.1 },
    { date: '2025-04-07', price: 135.7 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Market Watchlists</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
          </span>
          <Button size="sm" onClick={loadWatchlists} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {/* Market Overview watchlist - always visible */}
      <WatchlistTable 
        title="Market Overview" 
        items={watchlists.marketOverview}
        isLoading={isLoading} 
      />
      
      <Tabs defaultValue="dinosaurThemed" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="dinosaurThemed">Dino Themed</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="lottoPicks">Lotto Picks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="indices">Indices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dinosaurThemed" className="space-y-4">
          <WatchlistTable 
            title="Dinosaur Themed Stocks" 
            items={watchlists.dinosaurThemed}
            isLoading={isLoading && activeTab === 'dinosaurThemed'} 
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Price Trend</h3>
            <div className="h-64">
              <ChartContainer config={{}} className="h-full">
                <LineChart data={mockPriceHistory}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#22c55e" activeDot={{ r: 8 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="technology" className="space-y-4">
          <WatchlistTable 
            title="Technology Stocks" 
            items={watchlists.technology}
            isLoading={isLoading && activeTab === 'technology'} 
          />
        </TabsContent>
        
        <TabsContent value="energy" className="space-y-4">
          <WatchlistTable 
            title="Energy Stocks" 
            items={watchlists.energy}
            isLoading={isLoading && activeTab === 'energy'} 
          />
        </TabsContent>
        
        <TabsContent value="lottoPicks" className="space-y-4">
          <WatchlistTable 
            title="Lotto Picks" 
            items={watchlists.lottoPicks}
            isLoading={isLoading && activeTab === 'lottoPicks'} 
          />
        </TabsContent>
        
        <TabsContent value="crypto" className="space-y-4">
          <WatchlistTable 
            title="Cryptocurrency" 
            items={watchlists.crypto}
            isLoading={isLoading && activeTab === 'crypto'} 
          />
        </TabsContent>
        
        <TabsContent value="indices" className="space-y-4">
          <WatchlistTable 
            title="Market Indices" 
            items={watchlists.indices}
            isLoading={isLoading && activeTab === 'indices'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Watchlists;

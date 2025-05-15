import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockQuotes, convertToWatchlistItems, defaultWatchlists, WatchlistItem } from '@/services/stockService';
import WatchlistTable from './WatchlistTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from '@/components/ui/use-toast';

const UPDATE_INTERVAL = 10000; // Update every 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

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
  const [retryCount, setRetryCount] = useState<number>(0);

  // Function to load watchlist data with retry logic
  const loadWatchlists = useCallback(async () => {
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
        setRetryCount(0); // Reset retry count on success
      } else if (retryCount < MAX_RETRIES) {
        // Retry if no data received
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadWatchlists();
        }, RETRY_DELAY);
      } else {
        toast({
          title: "Unable to fetch data",
          description: "Please try again later or contact support if the problem persists.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadWatchlists();
        }, RETRY_DELAY);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, retryCount]);

  // Load initial data
  useEffect(() => {
    loadWatchlists();
  }, [activeTab, loadWatchlists]);

  // Set up automatic updates
  useEffect(() => {
    const intervalId = setInterval(loadWatchlists, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadWatchlists]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Market Watchlists</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
          </span>
          <Button 
            size="sm" 
            onClick={() => {
              setRetryCount(0);
              loadWatchlists();
            }} 
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dinosaurThemed" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="dinosaurThemed">Dino Themed</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="lottoPicks">Lotto Picks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="indices">Indices</TabsTrigger>
        </TabsList>
        
        {Object.entries(defaultWatchlists).map(([key, _]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <WatchlistTable 
              title={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} Stocks`}
              items={watchlists[key]}
              isLoading={isLoading && activeTab === key} 
            />
            
            {key === activeTab && watchlists[key].length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Price Trend</h3>
                <div className="h-64">
                  <ChartContainer config={{}} className="h-full">
                    <LineChart data={watchlists[key].map(item => ({
                      symbol: item.symbol,
                      price: item.price,
                      time: item.lastUpdated.toLocaleTimeString()
                    }))}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#22c55e" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Watchlists;

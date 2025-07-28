<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStockQuotes, convertToWatchlistItems, defaultWatchlists, WatchlistItem } from '../services/stockService';
=======

import React, { useState, useEffect } from 'react';
import { fetchStockQuotes, convertToWatchlistItems, defaultWatchlists, WatchlistItem } from '@/services/stockService';
>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803
import WatchlistTable from './WatchlistTable';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

<<<<<<< HEAD
const UPDATE_INTERVAL = 10000; // Update every 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

=======
>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803
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
  const [filter, setFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
        toast("Unable to fetch data. Please try again later or contact support if the problem persists.");
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

  // Load data when tab changes
  useEffect(() => {
    loadWatchlists();
<<<<<<< HEAD
  }, [activeTab, loadWatchlists]);

  // Set up automatic updates
  useEffect(() => {
    const intervalId = setInterval(loadWatchlists, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadWatchlists]);
=======
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadWatchlists();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activeTab]);
>>>>>>> 8c9f8871159954befd92e27ce0ea2c6c72815803

  // Get filtered and sorted watchlist
  const filteredWatchlist = useMemo(() => {
    const currentWatchlist = watchlists[activeTab] || [];
    
    // Apply filter
    let result = currentWatchlist;
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(item => 
        item.symbol.toLowerCase().includes(lowerFilter) || 
        item.name.toLowerCase().includes(lowerFilter)
      );
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'changePercent':
          comparison = a.changePercent - b.changePercent;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [watchlists, activeTab, filter, sortOption, sortDirection]);

  // Function to toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Market Watchlists</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
          </span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setRetryCount(0);
              loadWatchlists();
            }} 
            disabled={isLoading}
            className="bg-transparent text-green-400 border-green-500 hover:bg-green-900/20"
          >
            {isLoading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      <div className="bg-black border border-gray-800 rounded-lg p-4">
        <Tabs defaultValue="dinosaurThemed" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 mb-4 bg-gray-900">
            <TabsTrigger value="dinosaurThemed">Dino Themed</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="marketOverview">Market</TabsTrigger>
            <TabsTrigger value="lottoPicks">Lotto Picks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="indices">Indices</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input 
                placeholder="Filter by symbol or name" 
                value={filter} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)} 
                className="bg-gray-900 border-gray-800 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="symbol">Symbol</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="change">Change</SelectItem>
                  <SelectItem value="changePercent">Change %</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={toggleSortDirection}
                className="bg-gray-900 border-gray-800 text-white w-10 h-10 p-0"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
          
          {Object.entries(defaultWatchlists).map(([key, _]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <WatchlistTable 
                title={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} Stocks`}
                items={key === activeTab ? filteredWatchlist : []}
                isLoading={isLoading && activeTab === key} 
              />
              
              {key === activeTab && filteredWatchlist.length > 0 && (
                <div className="mt-6 bg-black border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-white">Price Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredWatchlist.map(item => ({
                        symbol: item.symbol,
                        price: item.price,
                        time: item.lastUpdated.toLocaleTimeString()
                      }))}>
                        <XAxis dataKey="symbol" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #374151', color: '#fff' }} />
                        <Line type="monotone" dataKey="price" stroke="#22c55e" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Watchlists;

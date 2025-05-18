// DinoTradez main.js - Bundled application
(function() {
  'use strict';
  
  // Utility functions
  const utils = {
    cn: (...classes) => classes.filter(Boolean).join(' '),
    formatCurrency: (value) => `$${parseFloat(value).toFixed(2)}`
  };
  
  // Mock stock data API responses when needed
  const createMockStockQuote = (symbol) => {
    let basePrice = 0;
    
    // Generate somewhat realistic prices based on the symbol
    if (symbol.includes('BTC')) {
      basePrice = 40000 + Math.random() * 5000;
    } else if (symbol.includes('ETH')) {
      basePrice = 2500 + Math.random() * 300;
    } else if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(symbol)) {
      basePrice = 200 + Math.random() * 300;
    } else if (symbol.startsWith('^')) {
      if (symbol === '^DJI') {
        basePrice = 35000 + Math.random() * 1000;
      } else if (symbol === '^GSPC') {
        basePrice = 4500 + Math.random() * 200;
      } else if (symbol === '^IXIC') {
        basePrice = 14000 + Math.random() * 500;
      } else if (symbol === '^VIX') {
        basePrice = 15 + Math.random() * 10;
      } else {
        basePrice = 1000 + Math.random() * 200;
      }
    } else {
      basePrice = 20 + Math.random() * 180;
    }
    
    const change = (Math.random() * 2 - 1) * basePrice * 0.05; // +/- 5% change
    
    return {
      symbol,
      regularMarketPrice: parseFloat(basePrice.toFixed(2)),
      regularMarketChange: parseFloat(change.toFixed(2)),
      regularMarketChangePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      regularMarketTime: Math.floor(Date.now() / 1000),
      shortName: `${symbol.replace('-USD', '').replace('^', '')} ${getSymbolType(symbol)}`,
      longName: `${symbol.replace('-USD', '').replace('^', '')} ${getSymbolFullType(symbol)}`
    };
  };
  
  const getSymbolType = (symbol) => {
    if (symbol.includes('-USD')) return 'Crypto';
    if (symbol.startsWith('^')) return 'Index';
    if (symbol.endsWith('=F')) return 'Future';
    return 'Inc.';
  };
  
  const getSymbolFullType = (symbol) => {
    if (symbol.includes('-USD')) return 'Cryptocurrency';
    if (symbol.startsWith('^')) return 'Market Index';
    if (symbol.endsWith('=F')) return 'Futures Contract';
    return 'Corporation';
  };
  
  // Stock data service
  const stockService = {
    // API config
    API_KEY: '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee',
    API_HOST: 'yahoo-finance127.p.rapidapi.com',
    API_URL: 'https://yahoo-finance127.p.rapidapi.com/v1/finance/quote',
    
    // Default watchlist symbols
    defaultWatchlists: {
      dinosaurThemed: ['DINO', 'CEMI', 'GEVO', 'NE', 'RIG'],
      technology: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
      energy: ['XOM', 'CVX', 'BP', 'SHEL', 'TTE'],
      marketOverview: ['BTC-USD', 'GC=F', '^TNX', '^VIX'],
      lottoPicks: ['GME', 'AMC', 'BBBY', 'BBIG', 'MULN'],
      crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD', 'SHIB-USD'],
      indices: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
    },
    
    // Fetch stock quotes
    fetchStockQuotes: async function(symbols) {
      try {
        console.log('Fetching stock quotes for symbols:', symbols.join(','));
        
        try {
          const response = await fetch(`${this.API_URL}?symbols=${symbols.join(',')}`, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': this.API_KEY,
              'X-RapidAPI-Host': this.API_HOST,
            },
          });
          
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data || !Array.isArray(data.quoteResponse?.result)) {
            throw new Error('Invalid API response format');
          }
          
          return this.convertToWatchlistItems(data.quoteResponse.result.map(item => ({
            symbol: item.symbol,
            regularMarketPrice: item.regularMarketPrice,
            regularMarketChange: item.regularMarketChange,
            regularMarketChangePercent: item.regularMarketChangePercent,
            regularMarketTime: item.regularMarketTime || Math.floor(Date.now() / 1000),
            shortName: item.shortName || item.symbol,
            longName: item.longName
          })));
        } catch (error) {
          console.error('Error fetching from API:', error);
          // Fall back to mock data on error
          console.log('Falling back to mock data due to API error');
          return this.convertToWatchlistItems(symbols.map(symbol => createMockStockQuote(symbol)));
        }
      } catch (error) {
        console.error('Error fetching stock quotes:', error);
        
        // Show toast notification
        window.Sonner?.toast(`Failed to fetch stock data: ${error.message || "Unknown error"}. Using backup data.`);
        
        // Return mock data as fallback
        return this.convertToWatchlistItems(symbols.map(symbol => createMockStockQuote(symbol)));
      }
    },
    
    // Convert raw API data to WatchlistItem format
    convertToWatchlistItems: function(quotes) {
      return quotes.map(quote => ({
        id: quote.symbol,
        symbol: quote.symbol,
        name: quote.shortName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        lastUpdated: new Date(quote.regularMarketTime * 1000)
      }));
    }
  };
  
  // News data service
  const newsService = {
    // API config
    API_KEY: '48b0ef34e6msh9fe72fb5f0d3e4ap126332jsn1e6298c105ee',
    API_HOST: 'yahoo-finance15.p.rapidapi.com',
    API_URL: 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/ne/news',
    
    // Fetch market news
    fetchMarketNews: async function() {
      try {
        try {
          const response = await fetch(this.API_URL, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': this.API_KEY,
              'X-RapidAPI-Host': this.API_HOST,
            },
          });
          
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data || !Array.isArray(data)) {
            throw new Error('Invalid API response format');
          }
          
          return data.map(article => ({
            id: article.uuid || article.url || Math.random().toString(),
            title: article.title,
            summary: article.summary || article.description || '',
            url: article.link,
            source: article.publisher || 'Yahoo Finance',
            publishedAt: new Date(article.providerPublishTime * 1000 || Date.now()),
            relatedSymbols: article.relatedTickers || []
          }));
        } catch (error) {
          console.error('Error fetching from news API:', error);
          // Fall back to mock data on error
          console.log('Falling back to mock news data due to API error');
          return this.createMockNewsData();
        }
      } catch (error) {
        console.error('Error fetching market news:', error);
        window.Sonner?.toast(`Failed to fetch news: ${error.message || 'Unknown error'}. Using backup data.`);
        return this.createMockNewsData();
      }
    },
    
    // Creates mock news data for development and fallbacks
    createMockNewsData: function() {
      return [
        {
          id: '1',
          title: 'Markets Rally on Fed Decision',
          summary: 'Major indices closed higher after the Federal Reserve announced its latest interest rate decision.',
          url: 'https://example.com/news/1',
          source: 'Market Daily',
          publishedAt: new Date(),
          relatedSymbols: ['^GSPC', '^DJI', '^IXIC']
        },
        {
          id: '2',
          title: 'Tech Stocks Lead the Way',
          summary: 'Technology sector continues to outperform as earnings reports exceed expectations.',
          url: 'https://example.com/news/2',
          source: 'Tech Insider',
          publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
          relatedSymbols: ['AAPL', 'MSFT', 'GOOGL']
        },
        {
          id: '3',
          title: 'Energy Sector Faces Challenges',
          summary: 'Oil prices decline amid concerns about global demand and increasing supply.',
          url: 'https://example.com/news/3',
          source: 'Energy Report',
          publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
          relatedSymbols: ['XOM', 'CVX', 'BP']
        },
        {
          id: '4',
          title: 'Crypto Market Update',
          summary: 'Bitcoin and other cryptocurrencies show signs of recovery after recent volatility.',
          url: 'https://example.com/news/4',
          source: 'Crypto Daily',
          publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
          relatedSymbols: ['BTC-USD', 'ETH-USD']
        },
        {
          id: '5',
          title: 'Retail Sales Data Surprises Analysts',
          summary: 'Latest economic indicators show stronger than expected consumer spending.',
          url: 'https://example.com/news/5',
          source: 'Economic Times',
          publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
          relatedSymbols: ['WMT', 'TGT', 'AMZN']
        }
      ];
    }
  };
  
  // Initialize DinoTradez application
  async function initApp() {
    try {
      const appContent = document.getElementById('app-content');
      if (!appContent) return;
      
      // Show initial loading state
      appContent.innerHTML = `
        <div class="space-y-4">
          <div class="bg-black rounded-lg shadow-lg p-4 border border-gray-800">
            <h2 class="text-2xl font-bold text-white mb-4">Loading Market Data...</h2>
            <div class="animate-pulse space-y-4">
              <div class="bg-gray-900 h-10 rounded"></div>
              <div class="bg-gray-900 h-40 rounded"></div>
            </div>
          </div>
        </div>
      `;
      
      // Load initial watchlist data
      const activeTab = 'dinosaurThemed';
      const symbols = stockService.defaultWatchlists[activeTab];
      const stockItems = await stockService.fetchStockQuotes(symbols);
      
      // Load news data
      const newsItems = await newsService.fetchMarketNews();
      
      // Render the app with loaded data
      renderApp(appContent, {
        activeTab,
        watchlists: {
          [activeTab]: stockItems
        },
        news: newsItems
      });
      
      // Set up auto-refresh
      setInterval(async () => {
        try {
          const currentTab = document.querySelector('[data-active-tab]')?.dataset.activeTab || activeTab;
          const currentSymbols = stockService.defaultWatchlists[currentTab];
          const updatedStocks = await stockService.fetchStockQuotes(currentSymbols);
          
          // Update the watchlist table
          updateWatchlistTable(currentTab, updatedStocks);
          
          // Update last updated time
          document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      }, 30000); // Refresh every 30 seconds
      
    } catch (error) {
      console.error('Error initializing app:', error);
      document.getElementById('app-content').innerHTML = `
        <div class="bg-black rounded-lg shadow-lg p-4 border border-gray-800">
          <h2 class="text-2xl font-bold text-red-500">Error</h2>
          <p class="text-gray-400 mt-2">Unable to initialize DinoTradez. Please try refreshing the page.</p>
          <p class="text-gray-500 mt-1">${error.message || 'Unknown error'}</p>
        </div>
      `;
    }
  }
  
  // Render the full application UI
  function renderApp(container, data) {
    const { activeTab, watchlists, news } = data;
    const lastUpdated = new Date().toLocaleTimeString();
    
    container.innerHTML = `
      <div class="space-y-8">
        <!-- Watchlists Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Market Watchlists</h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400">
                Last updated: <span id="last-updated">${lastUpdated}</span>
              </span>
              <button id="refresh-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-3 bg-transparent text-green-400 border border-green-500 hover:bg-green-900/20">
                Refresh
              </button>
            </div>
          </div>
          
          <div class="bg-black border border-gray-800 rounded-lg p-4">
            <!-- Tabs -->
            <div class="tabs-container">
              <div class="grid grid-cols-7 mb-4 bg-gray-900 inline-flex h-10 items-center justify-center rounded-md p-1">
                ${Object.keys(stockService.defaultWatchlists).map(tab => `
                  <button 
                    class="tab-trigger px-3 py-1.5 text-sm font-medium transition-all rounded-sm ${tab === activeTab ? 'bg-green-900/50 text-green-400' : 'text-gray-400 hover:text-white'}"
                    data-tab="${tab}"
                  >
                    ${tab === 'dinosaurThemed' ? 'Dino Themed' : 
                      tab === 'marketOverview' ? 'Market' : 
                      tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                `).join('')}
              </div>
              
              <!-- Filter and Sort -->
              <div class="flex flex-wrap gap-4 mb-4">
                <div class="flex-1 min-w-[200px]">
                  <input 
                    id="filter-input"
                    placeholder="Filter by symbol or name" 
                    class="flex h-10 w-full rounded-md border border-gray-800 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 text-white"
                  />
                </div>
                <div class="flex gap-2">
                  <select 
                    id="sort-select"
                    class="flex h-10 w-[180px] items-center rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="symbol">Symbol</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="change">Change</option>
                    <option value="changePercent">Change %</option>
                  </select>
                  <button 
                    id="sort-direction-btn"
                    class="bg-gray-900 border-gray-800 text-white w-10 h-10 p-0 rounded-md border"
                    data-direction="asc"
                  >
                    ↑
                  </button>
                </div>
              </div>
              
              <!-- Watchlist Table -->
              <div id="watchlist-table-container" class="space-y-4">
                ${renderWatchlistTable(activeTab, watchlists[activeTab])}
              </div>
            </div>
          </div>
        </div>
        
        <!-- News Section -->
        <div class="bg-black rounded-lg shadow-lg p-4 border border-gray-800">
          <h2 class="text-2xl font-bold mb-4 text-white">Market News</h2>
          
          <div class="space-y-4">
            ${news.length === 0 ? 
              `<p class="text-gray-400 text-center py-4">No news available</p>` : 
              news.map(item => `
                <div class="bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded">
                  <a 
                    href="${item.url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="block"
                  >
                    <h3 class="font-medium text-white hover:text-green-400">${item.title}</h3>
                    <p class="text-gray-400 text-sm mt-1">${item.summary}</p>
                    <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>${item.source}</span>
                      <span>${new Date(item.publishedAt).toLocaleString()}</span>
                    </div>
                    ${item.relatedSymbols && item.relatedSymbols.length > 0 ? `
                      <div class="mt-2 flex flex-wrap gap-1">
                        ${item.relatedSymbols.map(symbol => `
                          <span class="px-2 py-1 bg-gray-800 text-green-400 text-xs rounded">
                            ${symbol}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </a>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    setupEventListeners(container, data);
  }
  
  // Render watchlist table HTML
  function renderWatchlistTable(tabName, items) {
    const title = `${tabName.charAt(0).toUpperCase() + tabName.slice(1).replace(/([A-Z])/g, ' $1')} Stocks`;
    
    if (!items || items.length === 0) {
      return `
        <div class="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div class="p-4 border-b border-gray-800">
            <h3 class="text-lg font-medium text-white">${title}</h3>
          </div>
          <div class="p-8 text-center">
            <p class="text-gray-400">No data available</p>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
        <div class="p-4 border-b border-gray-800">
          <h3 class="text-lg font-medium text-white">${title}</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-800">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody class="bg-black divide-y divide-gray-800">
              ${items.map(item => `
                <tr class="hover:bg-gray-900 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">${item.symbol}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${item.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-white">$${item.price.toFixed(2)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right ${
                    item.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }">
                    ${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400">
                    ${item.lastUpdated.toLocaleTimeString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Price Chart -->
      ${renderPriceChart(items)}
    `;
  }
  
  // Render price chart for watchlist items
  function renderPriceChart(items) {
    // Create data for recharts
    const chartData = items.map(item => ({
      symbol: item.symbol,
      price: item.price
    }));
    
    // Pass the chart data to the chart component
    return `
      <div class="mt-6 bg-black border border-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-medium mb-2 text-white">Price Trend</h3>
        <div class="h-64" id="price-chart" data-chart='${JSON.stringify(chartData)}'></div>
      </div>
    `;
  }
  
  // Update watchlist table with new data
  function updateWatchlistTable(tabName, items) {
    const container = document.getElementById('watchlist-table-container');
    if (container) {
      container.innerHTML = renderWatchlistTable(tabName, items);
      
      // Re-render chart
      renderChartFromData();
    }
  }
  
  // Setup event listeners for the app
  function setupEventListeners(container, data) {
    // Tab switching
    const tabTriggers = container.querySelectorAll('.tab-trigger');
    tabTriggers.forEach(trigger => {
      trigger.addEventListener('click', async () => {
        const tabName = trigger.dataset.tab;
        
        // Update active tab state
        tabTriggers.forEach(t => {
          t.classList.remove('bg-green-900/50', 'text-green-400');
          t.classList.add('text-gray-400', 'hover:text-white');
        });
        trigger.classList.add('bg-green-900/50', 'text-green-400');
        trigger.classList.remove('text-gray-400', 'hover:text-white');
        
        // Set active tab attribute for tracking
        trigger.setAttribute('data-active-tab', '');
        
        // Fetch data for the tab if needed
        let tabItems = data.watchlists[tabName];
        if (!tabItems || tabItems.length === 0) {
          // Show loading state
          document.getElementById('watchlist-table-container').innerHTML = `
            <div class="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
              <div class="p-4 border-b border-gray-800">
                <h3 class="text-lg font-medium text-white">${tabName.charAt(0).toUpperCase() + tabName.slice(1).replace(/([A-Z])/g, ' $1')} Stocks</h3>
              </div>
              <div class="p-8 text-center">
                <div class="animate-pulse flex flex-col items-center">
                  <div class="h-4 w-28 bg-gray-800 rounded mb-2"></div>
                  <div class="h-4 w-20 bg-gray-800 rounded"></div>
                </div>
                <p class="mt-4 text-gray-400">Loading data...</p>
              </div>
            </div>
          `;
          
          // Fetch data
          const symbols = stockService.defaultWatchlists[tabName];
          tabItems = await stockService.fetchStockQuotes(symbols);
          
          // Update data store
          data.watchlists[tabName] = tabItems;
        }
        
        // Update the display
        updateWatchlistTable(tabName, tabItems);
      });
    });
    
    // Refresh button
    const refreshBtn = container.querySelector('#refresh-btn');
    refreshBtn.addEventListener('click', async () => {
      // Get current active tab
      const currentTab = document.querySelector('[data-active-tab]')?.dataset.tab || data.activeTab;
      
      // Show loading state
      refreshBtn.textContent = 'Updating...';
      refreshBtn.disabled = true;
      
      try {
        // Fetch fresh data
        const symbols = stockService.defaultWatchlists[currentTab];
        const updatedStocks = await stockService.fetchStockQuotes(symbols);
        
        // Update data store
        data.watchlists[currentTab] = updatedStocks;
        
        // Update the display
        updateWatchlistTable(currentTab, updatedStocks);
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
      } catch (error) {
        console.error('Error refreshing data:', error);
        window.Sonner?.toast(`Error refreshing data: ${error.message || 'Unknown error'}`);
      } finally {
        refreshBtn.textContent = 'Refresh';
        refreshBtn.disabled = false;
      }
    });
    
    // Filter input
    const filterInput = container.querySelector('#filter-input');
    filterInput.addEventListener('input', () => {
      applyFilterAndSort();
    });
    
    // Sort select
    const sortSelect = container.querySelector('#sort-select');
    sortSelect.addEventListener('change', () => {
      applyFilterAndSort();
    });
    
    // Sort direction button
    const sortDirectionBtn = container.querySelector('#sort-direction-btn');
    sortDirectionBtn.addEventListener('click', () => {
      const currentDirection = sortDirectionBtn.dataset.direction;
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      
      sortDirectionBtn.dataset.direction = newDirection;
      sortDirectionBtn.textContent = newDirection === 'asc' ? '↑' : '↓';
      
      applyFilterAndSort();
    });
    
    // Apply filter and sort to watchlist
    function applyFilterAndSort() {
      const currentTab = document.querySelector('[data-active-tab]')?.dataset.tab || data.activeTab;
      const filterValue = filterInput.value.toLowerCase();
      const sortValue = sortSelect.value;
      const sortDirection = sortDirectionBtn.dataset.direction;
      
      // Get the base items
      let filteredItems = [...data.watchlists[currentTab] || []];
      
      // Apply filter
      if (filterValue) {
        filteredItems = filteredItems.filter(item => 
          item.symbol.toLowerCase().includes(filterValue) || 
          item.name.toLowerCase().includes(filterValue)
        );
      }
      
      // Apply sorting
      filteredItems.sort((a, b) => {
        let comparison = 0;
        
        switch (sortValue) {
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
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      // Update the display
      updateWatchlistTable(currentTab, filteredItems);
    }
    
    // Render charts after DOM is updated
    renderChartFromData();
  }
  
  // Render recharts chart with data
  function renderChartFromData() {
    const chartContainer = document.getElementById('price-chart');
    if (!chartContainer) return;
    
    try {
      const chartData = JSON.parse(chartContainer.dataset.chart || '[]');
      
      if (window.Recharts && chartData.length > 0) {
        // Create a chart with recharts
        const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = window.Recharts;
        
        // Clear the container
        while (chartContainer.firstChild) {
          chartContainer.removeChild(chartContainer.firstChild);
        }
        
        // Create React elements for the chart
        const chart = React.createElement(
          ResponsiveContainer,
          { width: '100%', height: '100%' },
          React.createElement(
            LineChart,
            { data: chartData },
            [
              React.createElement(XAxis, { dataKey: 'symbol', stroke: '#6b7280' }),
              React.createElement(YAxis, { stroke: '#6b7280' }),
              React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#374151' }),
              React.createElement(Tooltip, { 
                contentStyle: { 
                  backgroundColor: '#111', 
                  border: '1px solid #374151', 
                  color: '#fff' 
                } 
              }),
              React.createElement(Line, { 
                type: 'monotone', 
                dataKey: 'price', 
                stroke: '#22c55e', 
                activeDot: { r: 8 } 
              })
            ]
          )
        );
        
        // Render the chart
        ReactDOM.render(chart, chartContainer);
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      chartContainer.innerHTML = '<p class="text-red-500">Error rendering chart</p>';
    }
  }
  
  // Initialize the app when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})(); 
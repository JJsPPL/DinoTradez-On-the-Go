
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileNav from '@/components/MobileNav';
import Watchlists from '@/components/Watchlists';
import MarketIntelligence from '@/components/MarketIntelligence';
import APIKeyConfig from '@/components/APIKeyConfig';
import { Card, CardContent } from '@/components/ui/card';
import { getRapidAPIKey } from '@/services/stockService';

const Home = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Default to true since we have a default API key

  useEffect(() => {
    // This is just to ensure we check if the key exists
    setHasApiKey(!!getRapidAPIKey());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-black/70">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link to="/" className="font-bold text-xl text-gradient dino-gradient bg-clip-text text-transparent">
              DINO TRADEZ
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/marketplace">Marketplace</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portfolio">Portfolio</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trading">Trading</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="hero-section mb-8">
          <h1 className="hero-title">Welcome to DinoTradez</h1>
          <p className="hero-subtitle">
            Advanced trading intelligence for the modern investor
          </p>
        </div>
        
        {/* API key configuration is shown only if needed */}
        {!hasApiKey && (
          <div className="mb-8">
            <APIKeyConfig onConfigured={() => setHasApiKey(true)} />
          </div>
        )}
        
        <Watchlists />
        <MarketIntelligence />
        
        {/* Disclaimer Section */}
        <Card className="mt-8 bg-muted/50 border border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold mb-2">Important Notice:</h4>
                <p className="text-xs mb-3">
                  The use of DinoTradez site does not guarantee profitable results. This site should not be used as a standalone analysis tool. 
                  It is essential to combine it with other forms of analysis, such as fundamental analysis, technical analysis, risk 
                  management strategies, and awareness of current market conditions. Always conduct thorough research.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Note:</h4>
                <p className="text-xs mb-3">
                  The effectiveness of DinoTradez site can vary based on market conditions and individual trading styles. 
                  It's crucial to test strategies thoroughly using historical data before applying them in live trading scenarios.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Disclaimer:</h4>
                <p className="text-xs">
                  Trading financial instruments involves substantial risk and may not be suitable for all investors. 
                  Past performance is not indicative of future results. This website is provided for informational, 
                  educational and most importantly entertainment purposes only and should not be considered investment advice. 
                  Always conduct your own research before making any financial decisions. DinoTradez is not liable for your actions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/10 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DinoTradez. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

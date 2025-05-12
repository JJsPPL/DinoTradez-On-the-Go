
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileNav from '@/components/MobileNav';
import Watchlists from '@/components/Watchlists';
import MarketIntelligence from '@/components/MarketIntelligence';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-card/70">
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
        
        <Watchlists />
        
        <MarketIntelligence />
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

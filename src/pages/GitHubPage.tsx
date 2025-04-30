
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileNav from '@/components/MobileNav';

const GitHubPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link to="/" className="font-bold text-xl text-primary">
              DINO TRADEZ
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app">Go to Trading App</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Iframe showing the GitHub Pages site */}
      <main className="flex-1 w-full">
        <iframe 
          src="https://jjsppl.github.io/dinotradez/" 
          title="Dino Tradez GitHub Page"
          className="w-full h-screen border-0"
          style={{ height: 'calc(100vh - 64px)' }}
        />
      </main>
    </div>
  );
};

export default GitHubPage;

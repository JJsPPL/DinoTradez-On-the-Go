
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';

const GitHubPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset loading state when the component mounts
    setIsLoading(true);
    setHasError(false);
    
    // Add a timeout to check if the iframe is still loading after 5 seconds
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

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
        </div>
      </header>

      {/* Main Content - Iframe showing the GitHub Pages site */}
      <main className="flex-1 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
              <p>Loading GitHub Page...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center max-w-md mx-auto p-6 bg-card shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Unable to load GitHub Page</h3>
              <p className="mb-4 text-muted-foreground">The GitHub Page may be unavailable or still deploying after the repository rename.</p>
              <div className="flex flex-col space-y-2">
                <Button asChild variant="default">
                  <a 
                    href="https://jjsppl.github.io/DinoTradez-On-the-Go/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Open in new tab
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/app">
                    Go to App Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <iframe 
          src="https://jjsppl.github.io/DinoTradez-On-the-Go/" 
          title="Dino Tradez GitHub Page"
          className="w-full h-screen border-0"
          style={{ height: 'calc(100vh - 64px)' }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </main>
    </div>
  );
};

export default GitHubPage;

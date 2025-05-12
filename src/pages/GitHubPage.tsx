
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const GitHubPage = () => {
  const { toast } = useToast();
  const githubPagesUrl = "https://jjsppl.github.io/DinoTradez-On-the-Go/";

  useEffect(() => {
    // Notify user about redirection
    toast({
      title: "Redirecting to GitHub Pages",
      description: "Opening the latest version of Dino Tradez in a new tab.",
      duration: 5000,
    });
    
    // Open GitHub Pages in a new tab
    window.open(githubPagesUrl, '_blank');
  }, []);

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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-6 glass-card p-8 mt-10 animate-float">
          <h1 className="text-3xl font-bold text-gradient dino-gradient bg-clip-text text-transparent">Dino Tradez GitHub Page</h1>
          <p className="text-muted-foreground">
            The GitHub Page has been opened in a new tab. If it didn't open automatically, you can use the button below.
          </p>
          
          <div className="flex justify-center pt-4">
            <Button asChild variant="default" className="dino-gradient hover-scale">
              <a 
                href={githubPagesUrl}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open GitHub Page
              </a>
            </Button>
          </div>
        </div>
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

export default GitHubPage;

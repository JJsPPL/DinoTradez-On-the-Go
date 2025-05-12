
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileNav from '@/components/MobileNav';

const Portfolio = () => {
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
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">+0.0% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assets Owned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No changes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">No assets</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rarest Asset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">No assets</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Assets Found</h3>
                <p className="text-muted-foreground mb-6">
                  Start your collection by purchasing your first dino asset from the marketplace.
                </p>
                <Button asChild>
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-md p-6 text-center">
                  <p className="text-muted-foreground">No trading history available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Rex Prime</h3>
                        <p className="text-sm text-muted-foreground">Legendary Tyrannosaurus</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$28,500</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-2 w-full sm:w-auto" asChild>
                      <Link to="/trading">View Details</Link>
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Bronto Blue</h3>
                        <p className="text-sm text-muted-foreground">Rare Brontosaurus</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$16,200</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-2 w-full sm:w-auto" asChild>
                      <Link to="/trading">View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-muted-foreground">© 2025 Dino Tradez. All rights reserved.</p>
          <p className="text-xs text-muted-foreground mt-1">
            <a 
              href="https://jjsppl.github.io/dinotradez/" 
              className="hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub Pages
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;

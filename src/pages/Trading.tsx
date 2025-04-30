
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobileNav from '@/components/MobileNav';

const Trading = () => {
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
          <h1 className="text-3xl font-bold mb-6">Trading Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>
                    Monitor the latest dino asset prices and market movements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
                <TabsContent value="buy" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Buy Dino Assets</CardTitle>
                      <CardDescription>
                        Find and purchase new dino assets for your collection
                      </CardDescription>
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
                              <p className="text-sm text-green-600">+2.5% today</p>
                            </div>
                          </div>
                          <Button className="mt-2 w-full sm:w-auto">Buy Now</Button>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Velo Swift</h3>
                              <p className="text-sm text-muted-foreground">Rare Velociraptor</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$12,750</p>
                              <p className="text-sm text-muted-foreground">0% today</p>
                            </div>
                          </div>
                          <Button className="mt-2 w-full sm:w-auto">Buy Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sell" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sell Dino Assets</CardTitle>
                      <CardDescription>
                        List your dino assets for sale on the marketplace
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-8 rounded-md text-center">
                        <p className="text-muted-foreground">You don't have any dino assets to sell.</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link to="/marketplace">Browse Marketplace</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Trading Portfolio</CardTitle>
                  <CardDescription>
                    Your dino asset holdings and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <h3 className="text-2xl font-bold">$0.00</h3>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Assets Owned</p>
                      <h3 className="text-xl font-bold">0</h3>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/portfolio">View Portfolio</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Market News</CardTitle>
                  <CardDescription>
                    Latest updates from the dino trading world
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">New Species Discovery</h4>
                      <p className="text-sm text-muted-foreground">Rare fossils found in Argentina might lead to new tradeable assets</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Market Volatility Alert</h4>
                      <p className="text-sm text-muted-foreground">Herbivore assets showing increased trading volume</p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Trading Competition</h4>
                      <p className="text-sm text-muted-foreground">Annual Dino Trading Championship announced for next month</p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

export default Trading;

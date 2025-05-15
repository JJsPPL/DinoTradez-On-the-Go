import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobileNav from '@/components/MobileNav';
import Watchlists from '@/components/Watchlists';
import APIKeyConfig from '@/components/APIKeyConfig';
import { getRapidAPIKey } from '@/services/stockService';

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
                      Monitor the latest stock prices and market movements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Watchlists />
                  </CardContent>
                </Card>
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
          <div className="max-w-3xl mx-auto mb-6 space-y-4 text-sm text-muted-foreground">
            <div className="p-4 border rounded-md bg-muted/30">
              <h4 className="font-semibold mb-2">Important Notice:</h4>
              <p className="text-xs mb-3">
                The use of DinoTradez site does not guarantee profitable results. This site should not be used as a standalone analysis tool. 
                It is essential to combine it with other forms of analysis, such as fundamental analysis, technical analysis, risk 
                management strategies, and awareness of current market conditions. Always conduct thorough research.
              </p>
              <h4 className="font-semibold mb-2">Note:</h4>
              <p className="text-xs mb-3">
                The effectiveness of DinoTradez site can vary based on market conditions and individual trading styles. 
                It's crucial to test strategies thoroughly using historical data before applying them in live trading scenarios.
              </p>
              <h4 className="font-semibold mb-2">Disclaimer:</h4>
              <p className="text-xs">
                Trading financial instruments involves substantial risk and may not be suitable for all investors. 
                Past performance is not indicative of future results. This website is provided for informational, 
                educational and most importantly entertainment purposes only and should not be considered investment advice. 
                Always conduct your own research before making any financial decisions. DinoTradez is not liable for your actions.
              </p>
            </div>
          </div>
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

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MobileNav from '@/components/MobileNav';
import DinoCard from '@/components/DinoCard';
import { Link } from 'react-router-dom';

const featuredDinos = [
  {
    id: '1',
    name: 'Rex Prime',
    species: 'Tyrannosaurus',
    rarity: 'legendary' as const,
    price: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1561732292-1631789f933e?q=80&w=400&auto=format&fit=crop',
    trend: 'up' as const
  },
  {
    id: '2',
    name: 'Velo Swift',
    species: 'Velociraptor',
    rarity: 'rare' as const,
    price: 12750,
    imageUrl: 'https://images.unsplash.com/photo-1569794067383-f5a2536e914f?q=80&w=400&auto=format&fit=crop',
    trend: 'stable' as const
  },
  {
    id: '3',
    name: 'Tri Spike',
    species: 'Triceratops',
    rarity: 'uncommon' as const,
    price: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1616005660294-b11570501ee5?q=80&w=400&auto=format&fit=crop',
    trend: 'down' as const
  },
];

const Home = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link to="/app" className="font-bold text-xl text-primary">
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
        {/* Additional notice */}
        <div className="bg-accent text-accent-foreground p-2 text-center">
          <p>You're viewing the app version. <Link to="/" className="underline font-bold">Click here</Link> to see the GitHub Pages version.</p>
        </div>

        {/* Hero Section */}
        <section className="py-10 md:py-16">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold">
                  Trade Prehistoric Assets with 
                  <span className="text-primary block"> Modern Tech</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Discover, collect, and trade digital dinosaur assets in the world's first dino trading platform.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="lg" className="dino-gradient">
                    Start Trading
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a 
                      href="https://jjsppl.github.io/DinoTradez-On-the-Go/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit GitHub
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-md relative">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/20 rounded-full blur-xl"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1552689486-ce080445fbb6?q=80&w=600&auto=format&fit=crop"
                    alt="Dinosaur Trading" 
                    className="w-full h-auto rounded-2xl shadow-lg object-cover relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Dinos */}
        <section className="py-10 bg-muted/50">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl font-bold mb-6">Featured Dinos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDinos.map(dino => (
                <DinoCard key={dino.id} {...dino} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to="/marketplace">View All Dinos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <Card className="bg-primary text-primary-foreground p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to start your dino collection?</h2>
                  <p className="text-primary-foreground/80">Join thousands of traders in the prehistoric marketplace.</p>
                </div>
                <Button className="bg-white text-primary hover:bg-white/90 self-start" size="lg">
                  Sign Up Now
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-primary">DINO TRADEZ</h3>
              <p className="text-sm text-muted-foreground mt-2">Trading prehistoric assets since 2025</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-2">Platform</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><Link to="/" className="hover:text-foreground">Home</Link></li>
                  <li><Link to="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
                  <li><Link to="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Resources</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">GitHub</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    <a 
                      href="https://jjsppl.github.io/DinoTradez-On-the-Go/" 
                      className="hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub Page
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://github.com/JJsPPL/DinoTradez-On-the-Go" 
                      className="hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Repository
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <p>© 2025 Dino Tradez. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

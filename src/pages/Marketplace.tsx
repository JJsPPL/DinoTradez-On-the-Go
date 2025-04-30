
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DinoCard, { DinoCardProps } from '@/components/DinoCard';
import MobileNav from '@/components/MobileNav';

const marketplaceDinos: DinoCardProps[] = [
  {
    id: '1',
    name: 'Rex Prime',
    species: 'Tyrannosaurus',
    rarity: 'legendary',
    price: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1561732292-1631789f933e?q=80&w=400&auto=format&fit=crop',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Velo Swift',
    species: 'Velociraptor',
    rarity: 'rare',
    price: 12750,
    imageUrl: 'https://images.unsplash.com/photo-1569794067383-f5a2536e914f?q=80&w=400&auto=format&fit=crop',
    trend: 'stable'
  },
  {
    id: '3',
    name: 'Tri Spike',
    species: 'Triceratops',
    rarity: 'uncommon',
    price: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1616005660294-b11570501ee5?q=80&w=400&auto=format&fit=crop',
    trend: 'down'
  },
  {
    id: '4',
    name: 'Bronto Blue',
    species: 'Brontosaurus',
    rarity: 'rare',
    price: 16200,
    imageUrl: 'https://images.unsplash.com/photo-1582380380204-ddc45bd0f77f?q=80&w=400&auto=format&fit=crop',
    trend: 'up'
  },
  {
    id: '5',
    name: 'Stego Shield',
    species: 'Stegosaurus',
    rarity: 'uncommon',
    price: 9300,
    imageUrl: 'https://images.unsplash.com/photo-1587870506659-7e118ed71c97?q=80&w=400&auto=format&fit=crop',
    trend: 'stable'
  },
  {
    id: '6',
    name: 'Anky Armor',
    species: 'Ankylosaurus',
    rarity: 'common',
    price: 5600,
    imageUrl: 'https://images.unsplash.com/photo-1577237271491-b3f89347a047?q=80&w=400&auto=format&fit=crop',
    trend: 'up'
  }
];

const Marketplace = () => {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Discover and trade digital dinosaur assets</p>
            </div>
            <Button asChild>
              <Link to="/trading">Start Trading</Link>
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full">
                  <Input placeholder="Search dino assets..." />
                </div>
                <div className="w-full md:w-[180px]">
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[180px]">
                  <Select defaultValue="price_desc">
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {marketplaceDinos.map(dino => (
              <DinoCard key={dino.id} {...dino} />
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline">Load More</Button>
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

export default Marketplace;

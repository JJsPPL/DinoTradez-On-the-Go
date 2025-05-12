
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface DinoCardProps {
  id: string;
  name: string;
  species: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  imageUrl: string;
  trend: 'up' | 'down' | 'stable';
}

const rarityColors = {
  common: 'bg-gray-200 text-gray-800',
  uncommon: 'bg-blue-200 text-blue-800',
  rare: 'bg-purple-200 text-purple-800',
  legendary: 'bg-amber-200 text-amber-800'
};

const trendIcons = {
  up: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
      <path d="M12 4L20 12H16V20H8V12H4L12 4Z" fill="currentColor" />
    </svg>
  ),
  down: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
      <path d="M12 20L4 12H8V4H16V12H20L12 20Z" fill="currentColor" />
    </svg>
  ),
  stable: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const DinoCard: React.FC<DinoCardProps> = ({ name, species, rarity, price, imageUrl, trend }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative pb-[60%]">
        <img 
          src={imageUrl} 
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${rarityColors[rarity]}`}>
          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
        </Badge>
      </div>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{species}</CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {trendIcons[trend]}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {trend === 'up' ? '+2.5%' : trend === 'down' ? '-1.8%' : '0%'}
            </span>
          </div>
          <span className="font-bold">${price.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3">
        <Button className="w-full dino-gradient text-white">Trade</Button>
      </CardFooter>
    </Card>
  );
};

export default DinoCard;


import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WatchlistItem } from '@/services/stockService';

interface WatchlistTableProps {
  title: string;
  items: WatchlistItem[];
  isLoading: boolean;
}

const WatchlistTable: React.FC<WatchlistTableProps> = ({ title, items, isLoading }) => {
  // Simple function to display the title properly
  const displayTitle = () => {
    if (title === "Bullish Watchlist") return "Bullish";
    if (title === "Bearish Watchlist") return "Bearish";
    return title;
  };

  return (
    <div className="rounded-md border">
      <div className="bg-muted/50 p-2 font-medium">{displayTitle()}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Loading data...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No stocks found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WatchlistTable;

import React from 'react';
import { WatchlistItem } from '../services/stockService';

interface WatchlistTableProps {
  title: string;
  items: WatchlistItem[];
  isLoading: boolean;
}

const WatchlistTable: React.FC<WatchlistTableProps> = ({ title, items, isLoading }) => {
  return (
    <div className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-28 bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-800 rounded"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-400">No data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-800">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">{item.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">${item.price.toFixed(2)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    item.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400">
                    {item.lastUpdated.toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistTable; 
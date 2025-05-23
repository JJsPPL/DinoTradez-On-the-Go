
import React from 'react';
import Watchlists from '../components/Watchlists';
import NewsSection from '../components/NewsSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-green-500">DinoTradez</h1>
          <p className="text-gray-400">Real-time Stock Market Data</p>
        </header>
        
        <main className="space-y-8">
          <Watchlists />
          <NewsSection />
        </main>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} DinoTradez. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

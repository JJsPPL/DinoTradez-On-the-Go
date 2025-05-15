import React from 'react';
import Watchlists from '../components/Watchlists';

const App: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">DinoTradez</h1>
        <p className="text-gray-600">Real-time Stock Market Data</p>
      </header>
      
      <main>
        <Watchlists />
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} DinoTradez. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App; 
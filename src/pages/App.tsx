import React, { useEffect, useRef } from 'react';
import Watchlists from '../components/Watchlists';
import NewsSection from '../components/NewsSection';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix rain effect
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize the drops array
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height);
    }

    // Characters to display
    const chars = "01".split("");

    // Animation function
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0"; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw the character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Move drops down
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    };

    draw();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative">
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      
      <div className="container mx-auto p-4 relative z-10">
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
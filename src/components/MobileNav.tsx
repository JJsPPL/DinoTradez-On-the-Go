
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';

type NavLink = {
  title: string;
  href: string;
};

const navLinks: NavLink[] = [
  { title: 'Home', href: '/' },
  { title: 'Trading', href: '/trading' },
  { title: 'Portfolio', href: '/portfolio' },
  { title: 'Marketplace', href: '/marketplace' },
  { title: 'About', href: '/about' },
];

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[350px]">
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-primary">DINO TRADEZ</span>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center py-2 px-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t">
            <a 
              href="https://jjsppl.github.io/dinotradez/" 
              className="flex items-center py-2 px-3 text-foreground hover:text-primary rounded-md transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub Page
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

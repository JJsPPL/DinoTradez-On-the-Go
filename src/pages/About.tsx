
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MobileNav from '@/components/MobileNav';

const About = () => {
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
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container px-4 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Dino Tradez</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bringing the prehistoric world to modern trading
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 md:py-20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1561732292-1631789f933e?q=80&w=600&auto=format&fit=crop"
                  alt="Dino Tradez Story" 
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-lg">
                  <p>
                    Founded in 2025, Dino Tradez emerged from a passion for paleontology and digital trading. 
                    Our mission is to create an immersive platform where enthusiasts can collect, trade, and 
                    invest in digital dinosaur assets.
                  </p>
                  <p>
                    What started as a small project between dinosaur fans has evolved into the premier 
                    digital dinosaur trading platform, connecting collectors and investors from around the world.
                  </p>
                  <p>
                    Today, we're proud to offer a secure, intuitive platform for dinosaur enthusiasts and 
                    digital collectors alike, with an ever-expanding collection of unique digital assets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Dino Tradez</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-background">
                <CardContent className="pt-6 pb-8">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15L8.5 10L15.5 10L12 15Z" fill="currentColor" />
                      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Authentic Assets</h3>
                  <p className="text-center text-muted-foreground">
                    Each dinosaur asset is meticulously designed and authenticated with blockchain technology.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardContent className="pt-6 pb-8">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Secure Trading</h3>
                  <p className="text-center text-muted-foreground">
                    Our platform ensures safe, transparent transactions with advanced security protocols.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardContent className="pt-6 pb-8">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8C17.1046 8 18 7.10457 18 6C18 4.89543 17.1046 4 16 4C14.8954 4 14 4.89543 14 6C14 7.10457 14.8954 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 14C9.10457 14 10 13.1046 10 12C10 10.8954 9.10457 10 8 10C6.89543 10 6 10.8954 6 12C6 13.1046 6.89543 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 20C17.1046 20 18 19.1046 18 18C18 16.8954 17.1046 16 16 16C14.8954 16 14 16.8954 14 18C14 19.1046 14.8954 20 16 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 12L14 18M14 6L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Community Focus</h3>
                  <p className="text-center text-muted-foreground">
                    Join a growing community of collectors and traders who share your passion for dinosaurs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Connect with GitHub */}
        <section className="py-12 md:py-20">
          <div className="container px-4 mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-8 px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Visit Our GitHub</h2>
                    <p className="text-primary-foreground/90">
                      Check out our project repository and GitHub Pages site for more information.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="secondary" asChild>
                      <a 
                        href="https://github.com/JJsPPL/DinoTradez-On-the-Go" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub Repo
                      </a>
                    </Button>
                    <Button variant="secondary" asChild>
                      <a 
                        href="https://jjsppl.github.io/DinoTradez-On-the-Go/" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub Pages
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">Alex Rex</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">Samantha Raptor</h3>
                <p className="text-muted-foreground">Lead Developer</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">Michael Tri</h3>
                <p className="text-muted-foreground">Head of Design</p>
              </div>
            </div>
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

export default About;

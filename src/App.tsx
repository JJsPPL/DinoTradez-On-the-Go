
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trading from "./pages/Trading";
import Portfolio from "./pages/Portfolio";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import GitHubPage from "./pages/GitHubPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GitHubPage />} />
          <Route path="/app" element={<Home />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

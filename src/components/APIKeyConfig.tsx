
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setRapidAPIKey, getRapidAPIKey } from '@/services/stockService';
import { toast } from '@/components/ui/use-toast';

const APIKeyConfig = ({ onConfigured }: { onConfigured?: () => void }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = getRapidAPIKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    setRapidAPIKey(apiKey.trim());
    toast({
      title: "Success",
      description: "RapidAPI key has been saved",
    });
    if (onConfigured) onConfigured();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure API Key</CardTitle>
        <CardDescription>
          Enter your RapidAPI key for the Yahoo Finance API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Get your API key from <a href="https://rapidapi.com/finapi/api/yahoo-finance15" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RapidAPI Yahoo Finance</a>
            </p>
          </div>
          <Input 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="Enter your RapidAPI key"
            type="password"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveKey}>Save API Key</Button>
      </CardFooter>
    </Card>
  );
};

export default APIKeyConfig;

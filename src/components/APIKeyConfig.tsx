import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const APIKeyConfig = ({ onConfigured }: { onConfigured?: () => void }) => {
  React.useEffect(() => {
    // Always trigger onConfigured since we're using a default key
    if (onConfigured) onConfigured();
  }, [onConfigured]);

  // Return null since we don't need the UI anymore
  return null;
};

export default APIKeyConfig;

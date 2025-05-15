import React from 'react';

interface ChartContainerProps {
  config: any;
  className?: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  config, 
  className = '',
  children 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}; 
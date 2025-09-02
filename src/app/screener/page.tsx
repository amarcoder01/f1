import React from 'react';
import StockScreener from '@/components/screener/StockScreener';

export default function ScreenerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Stock Screener</h1>
          <p className="text-muted-foreground mt-2">
            Advanced stock screening with real-time data and comprehensive filters
          </p>
        </div>
        <StockScreener />
      </div>
    </div>
  );
}

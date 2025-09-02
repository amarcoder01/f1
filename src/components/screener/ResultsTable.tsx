'use client';

import React from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Download, Loader2 } from 'lucide-react';
import { ScreenerStock, SortConfig } from '@/types/screener';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ResultsTableProps {
  stocks: ScreenerStock[];
  loading: boolean;
  error?: string;
  sortConfig: SortConfig;
  onSort: (field: keyof ScreenerStock) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onExportCSV: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  stocks,
  loading,
  error,
  sortConfig,
  onSort,
  hasMore,
  loadingMore,
  onLoadMore,
  onExportCSV,
}) => {
  const formatNumber = (value: number | undefined, decimals = 2): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatMarketCap = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    const formatted = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    return formatted;
  };

  const getPercentageColor = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'text-muted-foreground';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSortIcon = (field: keyof ScreenerStock) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 text-muted-foreground" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />;
  };

  const handleSort = (field: keyof ScreenerStock) => {
    onSort(field);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading stocks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Screening Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              {stocks.length} stocks found with real-time data
            </p>
          </div>
          <Badge variant="secondary">
            {stocks.length} Results
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('ticker')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    {getSortIcon('ticker')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company Name</span>
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    {getSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('change')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Change</span>
                    {getSortIcon('change')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('change_percent')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Change %</span>
                    {getSortIcon('change_percent')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Volume</span>
                    {getSortIcon('volume')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('market_cap')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Market Cap</span>
                    {getSortIcon('market_cap')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('sector')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sector</span>
                    {getSortIcon('sector')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('exchange')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Exchange</span>
                    {getSortIcon('exchange')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No stocks found matching your criteria
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock) => (
                  <TableRow key={stock.ticker} className="hover:bg-accent/50">
                    <TableCell className="font-medium">
                      <span className="font-mono">{stock.ticker}</span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {stock.name}
                    </TableCell>
                    <TableCell>
                      {stock.price ? `$${formatNumber(stock.price)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {stock.change !== undefined ? (
                        <div className="flex items-center space-x-1">
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={getPercentageColor(stock.change)}>
                            {formatNumber(stock.change)}
                          </span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={getPercentageColor(stock.change_percent)}>
                        {formatPercentage(stock.change_percent)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatVolume(stock.volume)}
                    </TableCell>
                    <TableCell>
                      {formatMarketCap(stock.market_cap)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {stock.sector || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {stock.exchange || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={onLoadMore}
              disabled={loadingMore}
              variant="outline"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                'Load More Stocks'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
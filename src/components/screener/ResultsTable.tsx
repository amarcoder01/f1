'use client';

import React from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Download, Loader2 } from 'lucide-react';
import { ScreenerStock, SortConfig } from '@/types/screener';
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

  const columns = [
    { field: 'ticker' as keyof ScreenerStock, label: 'Symbol', width: 'w-20' },
    { field: 'name' as keyof ScreenerStock, label: 'Company Name', width: 'w-48' },
    { field: 'price' as keyof ScreenerStock, label: 'Price', width: 'w-24' },
    { field: 'change' as keyof ScreenerStock, label: 'Change', width: 'w-24' },
    { field: 'change_percent' as keyof ScreenerStock, label: 'Change %', width: 'w-24' },
    { field: 'market_cap' as keyof ScreenerStock, label: 'Market Cap', width: 'w-28' },
    { field: 'exchange' as keyof ScreenerStock, label: 'Exchange', width: 'w-20' },
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Screening Results
            </h2>
            <p className="text-sm text-muted-foreground">
              {stocks.length} stocks found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              disabled={stocks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onLoadMore}
              disabled={!hasMore || loadingMore}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {loadingMore ? 'Loading...' : hasMore ? 'Load More' : 'No more results'}
            </button>
            {/* When fully loaded, we simply disable the button without extra banner */}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto screener-table-container">
        <div className="min-w-full">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className={`${column.width} px-3 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-colors`}
                    onClick={() => onSort(column.field)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="hidden sm:inline">{column.label}</span>
                      <span className="sm:hidden">{column.label.split(' ')[0]}</span>
                      {getSortIcon(column.field)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 lg:px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <p className="text-lg font-medium">No stocks found</p>
                      <p className="text-sm text-center">Try adjusting your filters to see more results</p>
                    </div>
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.ticker} className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {stock.ticker}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="text-sm text-foreground truncate max-w-32 lg:max-w-48" title={stock.name}>
                        {stock.name}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        ${formatNumber(stock.price)}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium flex items-center gap-1 ${getPercentageColor(stock.change)}`}>
                        {stock.change !== undefined && stock.change !== null && (
                          stock.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )
                        )}
                        <span className="hidden sm:inline">${formatNumber(stock.change)}</span>
                        <span className="sm:hidden">{formatNumber(stock.change)}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPercentageColor(stock.change_percent)}`}>
                        {formatPercentage(stock.change_percent)}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        <span className="hidden sm:inline">{formatMarketCap(stock.market_cap)}</span>
                        <span className="sm:hidden">{formatMarketCap(stock.market_cap).replace(/[A-Z]/g, '')}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 lg:px-2.5 lg:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span className="hidden sm:inline">{stock.exchange}</span>
                        <span className="sm:hidden">{stock.exchange?.slice(0, 3)}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterCriteria } from '@/types/screener';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterControlsProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
  searchLoading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onSearch,
  loading = false,
  searchLoading = false,
}) => {
  const handleInputChange = (field: keyof FilterCriteria, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [field]: value === '' ? undefined : value,
    };
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    handleInputChange('search', value);
    onSearch(value);
  };



  const sectors = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consumer Cyclical',
    'Communication Services',
    'Industrials',
    'Consumer Defensive',
    'Energy',
    'Utilities',
    'Real Estate',
    'Basic Materials',
  ];

  const exchanges = [
    'NASDAQ',
    'NYSE',
    'NYSE American',
    'NYSE Arca',
    'OTC Markets',
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Screening Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-800 font-medium">Real-time Screening</p>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Filters applied across the complete market with live data
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Search by Symbol or Company
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="e.g., AAPL or Apple"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={searchLoading}
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => handleInputChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => handleInputChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Market Cap Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Market Cap Range ($M)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.marketCapMin || ''}
              onChange={(e) => handleInputChange('marketCapMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.marketCapMax || ''}
              onChange={(e) => handleInputChange('marketCapMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Volume Min */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Minimum Volume
          </label>
          <Input
            type="number"
            placeholder="e.g., 1000000"
            value={filters.volumeMin || ''}
            onChange={(e) => handleInputChange('volumeMin', e.target.value ? parseInt(e.target.value) : undefined)}
            className="text-sm"
          />
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Sector
          </label>
          <Select
            value={filters.sector}
            onValueChange={(value) => handleInputChange('sector', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
                         <SelectContent>
               <SelectItem value="all">All Sectors</SelectItem>
               {sectors.map((sector) => (
                 <SelectItem key={sector} value={sector}>
                   {sector}
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        </div>

        {/* Exchange */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Exchange
          </label>
          <Select
            value={filters.exchange}
            onValueChange={(value) => handleInputChange('exchange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
                         <SelectContent>
               <SelectItem value="all">All Exchanges</SelectItem>
               {exchanges.map((exchange) => (
                 <SelectItem key={exchange} value={exchange}>
                   {exchange}
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        </div>

        {/* Apply Filters Button */}
        <Button
          onClick={onApplyFilters}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Applying Filters...' : 'Apply Filters'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterControls;

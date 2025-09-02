import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterCriteria } from '../types/stock';

interface FilterControlsProps {
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
}) => {
  const handleInputChange = (field: keyof FilterCriteria, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value === '' ? undefined : value,
    });
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
    'AMEX',
    'OTC',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Screening Filters
        </h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
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
        <label className="block text-sm font-medium text-gray-700">
          Search by Symbol or Company
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="e.g., AAPL or Apple"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => handleInputChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => handleInputChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Market Cap Range */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Market Cap ($ Millions)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.marketCapMin || ''}
            onChange={(e) => handleInputChange('marketCapMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.marketCapMax || ''}
            onChange={(e) => handleInputChange('marketCapMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      {/* Volume */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Minimum Volume
        </label>
        <input
          type="number"
          placeholder="e.g., 1000000"
          value={filters.volumeMin || ''}
          onChange={(e) => handleInputChange('volumeMin', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
      </div>



      {/* Sector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sector
        </label>
        <select
          value={filters.sector || ''}
          onChange={(e) => handleInputChange('sector', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Sectors</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      {/* Exchange */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Exchange
        </label>
        <select
          value={filters.exchange || ''}
          onChange={(e) => handleInputChange('exchange', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Exchanges</option>
          {exchanges.map((exchange) => (
            <option key={exchange} value={exchange}>
              {exchange}
            </option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={onApplyFilters}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Applying Filters...' : 'Apply Filters'}
      </button>
    </div>
  );
};

export default FilterControls;
import React from 'react'
import { MarketStatusProps } from '@/types/top-movers'
import { TopMoversApiService } from '@/lib/top-movers-api'
import { LoadingSpinner } from './LoadingSpinner'

export const MarketStatus: React.FC<MarketStatusProps> = ({ marketStatus, loading }) => {
  const isOpen = TopMoversApiService.isMarketOpen(marketStatus)
  const message = TopMoversApiService.formatMarketStatusMessage(marketStatus)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Market Status
            </h2>
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : message}
            </p>
          </div>
        </div>
        {loading && <LoadingSpinner size="small" />}
      </div>
    </div>
  )
}

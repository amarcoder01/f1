import React from 'react'
import { MarketStatusProps } from '@/types/top-movers'
import { LoadingSpinner } from './LoadingSpinner'

export const MarketStatus: React.FC<MarketStatusProps> = ({ 
  marketStatus, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <LoadingSpinner size="small" className="mr-3" />
          <span className="text-blue-800">Loading market status...</span>
        </div>
      </div>
    )
  }

  if (!marketStatus) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <span className="text-gray-600">Market status unavailable</span>
      </div>
    )
  }

  const isOpen = marketStatus.market === 'open'
  const statusColor = isOpen ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
  const statusText = isOpen ? 'Market Open' : 'Market Closed'
  const statusIcon = isOpen ? '🟢' : '🔵'

  return (
    <div className={`${statusColor} border rounded-lg p-4 mb-8`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{statusIcon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{statusText}</h3>
                         <p className="text-sm text-gray-600">
               {isOpen ? 'Real-time data available' : 'Showing last trading day data from Polygon.io'}
             </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last Updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(marketStatus.serverTime).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}

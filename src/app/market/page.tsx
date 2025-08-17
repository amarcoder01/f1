'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  DollarSign,
  Volume2,
  Building2,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stock } from '@/types'

interface MarketStock extends Stock {
  vwap?: number
  timestamp?: string
  isRealTime?: boolean
}

interface MarketStatus {
  isOpen: boolean
  nextOpen: string | null
  nextClose: string | null
  lastUpdated: string
}

interface MarketResponse {
  stocks: MarketStock[]
  hasMore: boolean
  isRealTime: boolean
  total: number
  offset: number
  limit: number
}

const BATCH_SIZE = 50

export default function MarketPage() {
  // State management
  const [stocks, setStocks] = useState<MarketStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [isRealTimeData, setIsRealTimeData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMoreStocks, setHasMoreStocks] = useState(true)
  const [lastOffset, setLastOffset] = useState(0)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch market status
  const fetchMarketStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/market/status')
      if (response.ok) {
        const data = await response.json()
        setMarketStatus(data)
        setIsRealTimeData(data.isRealTime)
      }
    } catch (error) {
      console.error('Error fetching market status:', error)
    }
  }, [])

  // Fetch stocks with pagination
  const fetchStocks = useCallback(async (offset: number = 0, append: boolean = false) => {
    try {
      if (offset === 0) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)
      
      const response = await fetch(`/api/market/stocks?limit=${BATCH_SIZE}&offset=${offset}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.status}`)
      }
      
      const data: MarketResponse = await response.json()
      
      if (append) {
        setStocks(prev => [...prev, ...data.stocks])
      } else {
        setStocks(data.stocks)
      }
      
      setHasMoreStocks(data.hasMore)
      setLastOffset(offset + data.stocks.length)
      setIsRealTimeData(data.isRealTime)
      
    } catch (error) {
      console.error('Error fetching stocks:', error)
      setError('Failed to load market data. Please try again.')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Load more stocks
  const loadMoreStocks = useCallback(() => {
    if (!isLoadingMore && hasMoreStocks) {
      fetchStocks(lastOffset, true)
    }
  }, [isLoadingMore, hasMoreStocks, lastOffset, fetchStocks])

  // Initialize data
  useEffect(() => {
    fetchMarketStatus()
    fetchStocks()
  }, [fetchMarketStatus, fetchStocks])

  // Auto-refresh data every minute when market is open
  useEffect(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }

    if (marketStatus?.isOpen) {
      const interval = setInterval(() => {
        fetchStocks(0, false) // Refresh first batch
      }, 60000) // 1 minute
      setAutoRefreshInterval(interval)
    }

    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
      }
    }
  }, [marketStatus?.isOpen, fetchStocks])

  // Format number with appropriate suffix
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  // Get change color
  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-500' : 'text-red-500'
  }

  // Stock item component
  const StockItem = ({ stock }: { stock: MarketStock }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{stock.name}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {stock.exchange}
          </Badge>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white text-lg">
            {formatPrice(stock.price)}
          </div>
          <div className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">Volume:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatNumber(stock.volume)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">VWAP:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {stock.vwap ? formatPrice(stock.vwap) : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">Market Cap:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatNumber(stock.marketCap)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">Updated:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(stock.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time US stock market data
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {marketStatus && (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {marketStatus.isOpen ? 'Market Open' : 'Market Closed'}
                  </span>
                </div>
              )}
              
              {isRealTimeData && (
                <Badge variant="secondary" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Live Data
                </Badge>
              )}
              
              {!marketStatus?.isOpen && (
                <Badge variant="secondary" className="text-xs">
                  ⚠ Market Closed – Showing Last Close Data
                </Badge>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Market Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>
              {stocks.length} US stocks loaded • {isRealTimeData ? 'Real-time data' : 'Previous close data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stocks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stocks Loaded</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stocks.filter(s => s.change > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Gainers</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stocks.filter(s => s.change < 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Losers</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stocks.filter(s => s.change === 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unchanged</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stocks Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              US Stocks
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {stocks.length} stocks
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockItem key={stock.symbol} stock={stock} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMoreStocks && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMoreStocks}
                disabled={isLoadingMore}
                size="lg"
                className="w-full max-w-md"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading More Stocks...
                  </>
                ) : (
                  'Load More Stocks'
                )}
              </Button>
            </div>
          )}
          
          {/* No More Stocks */}
          {!hasMoreStocks && stocks.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                All available stocks have been loaded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

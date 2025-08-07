'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Filter, TrendingUp, TrendingDown, Star, RefreshCw, Loader2, Check, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceTicker } from '@/components/trading/price-ticker'
import { PolygonConnectionStatus } from '@/components/PolygonConnectionStatus'
import { multiSourceAPI } from '@/lib/multi-source-api'
import { Stock, WatchlistItem } from '@/types'
import { useWatchlistStore } from '@/store'

// WebSocket event data type
interface WebSocketEvent {
  event: string
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
}

// WatchlistItem now includes all required fields

export default function WatchlistPage() {
  const { 
    watchlists, 
    addToWatchlist, 
    removeFromWatchlist, 
    createWatchlist,
    loadWatchlists,
    isLoading: storeLoading,
    isConnectedToRealTime,
    startRealTimeUpdates,
    stopRealTimeUpdates
  } = useWatchlistStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])  
  const [isSearching, setIsSearching] = useState(false)
  const [isAddingSymbol, setIsAddingSymbol] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPopular, setIsLoadingPopular] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set())

  // Get or create default watchlist
  const defaultWatchlist = watchlists.find(w => w.name === 'My Watchlist') || {
    id: 'default',
    name: 'My Watchlist',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Load watchlists on component mount
  useEffect(() => {
    const initializeWatchlist = async () => {
      try {
        setError(null)
        await loadWatchlists()
      } catch (err) {
        setError('Failed to load watchlists. Please try again.')
        console.error('Error loading watchlists:', err)
      }
    }
    initializeWatchlist()
  }, [loadWatchlists])

  // Refresh watchlist data when component mounts if there are items
  useEffect(() => {
    if (defaultWatchlist.items.length > 0 && !storeLoading) {
      // Small delay to ensure store is fully loaded
      const timer = setTimeout(() => {
        refreshWatchlistData()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [defaultWatchlist.items.length, storeLoading])

  // If no default watchlist exists, create one
  useEffect(() => {
    if (watchlists.length === 0 && !storeLoading) {
      createWatchlist('My Watchlist')
    }
  }, [watchlists, createWatchlist, storeLoading])

  // Start real-time updates for watchlist items using multi-source
  useEffect(() => {
    if (defaultWatchlist.items.length > 0) {
      const symbols = defaultWatchlist.items.map(item => item.symbol)
      
      // Set up periodic updates for all symbols
      const updateInterval = setInterval(async () => {
        try {
          const { updateWatchlistItem } = useWatchlistStore.getState()
          
          // Update each symbol with fresh data from multi-source
          for (const symbol of symbols) {
            try {
              const freshData = await multiSourceAPI.getStockData(symbol)
              if (freshData && freshData.price > 0) {
                const existingItem = defaultWatchlist.items.find(item => item.symbol === symbol)
                if (existingItem) {
                  updateWatchlistItem(defaultWatchlist.id, existingItem.id, {
                    price: freshData.price,
                    change: freshData.change,
                    changePercent: freshData.changePercent,
                    volume: freshData.volume
                  })
                }
              }
            } catch (error) {
              console.error(`Error updating ${symbol}:`, error)
            }
          }
        } catch (error) {
          console.error('Error in periodic update:', error)
        }
      }, 30000) // Update every 30 seconds

      return () => {
        clearInterval(updateInterval)
      }
    }
  }, [defaultWatchlist.items])

  // Start real-time updates when watchlist has items
  useEffect(() => {
    if (defaultWatchlist && defaultWatchlist.items.length > 0 && !isConnectedToRealTime) {
      try {
        startRealTimeUpdates()
      } catch (error) {
        console.error('Error starting real-time updates:', error)
        setError('Failed to connect to real-time data. Some features may be limited.')
      }
    }
    
    return () => {
      if (isConnectedToRealTime) {
        stopRealTimeUpdates()
      }
    }
  }, [defaultWatchlist?.items.length, isConnectedToRealTime, startRealTimeUpdates, stopRealTimeUpdates])

  // Enhanced search functionality using Polygon API (optimized for $29 plan)
  useEffect(() => {
    const searchStocks = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([])
        setIsAddingSymbol(false)
        setError(null)
        return
      }

      // Validate search query - only allow alphanumeric characters and basic symbols
      if (!/^[A-Za-z0-9.\-\s]+$/.test(searchQuery)) {
        setError('Please use only letters, numbers, and basic symbols in your search.')
        setSearchResults([])
        return
      }

      setIsSearching(true)
      setIsAddingSymbol(true)
      setError(null)
      
      try {
        console.log(`🔍 Searching for: "${searchQuery}"`)
        
        // Use the Next.js API route for search
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        const results = data.results || []
        setSearchResults(results)
        
        if (results.length === 0) {
          setError(`No US stocks found for "${searchQuery}". Try searching with a different term or check your API configuration.`)
        } else {
          console.log(`✅ Found ${results.length} stocks for "${searchQuery}"`)
        }
      } catch (error) {
        console.error('❌ Error searching stocks:', error)
        let errorMessage = 'Search failed. Please check your internet connection and API configuration.'
        
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            errorMessage = '🔑 Polygon API key is missing or invalid. Please check POLYGON_SETUP.md for setup instructions.'
          } else if (error.message.includes('Rate limit')) {
            errorMessage = '⏱️ Rate limit exceeded ($29 plan: 5 requests/minute). Please wait a moment before searching again.'
          } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = `📊 No stock data found for "${searchQuery}". Please check the symbol and try again.`
          } else if (error.message.includes('server error') || error.message.includes('500')) {
            errorMessage = '🔧 Polygon API is temporarily unavailable. Please try again later.'
          } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorMessage = '🌐 Network error. Please check your internet connection.'
          } else if (error.message.includes('timeout')) {
            errorMessage = '⏱️ Request timed out. Please try again with a shorter search term.'
          } else if (error.message.includes('forbidden') || error.message.includes('403')) {
            errorMessage = '🚫 Access forbidden. Please check your Polygon.io subscription status.'
          } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
            errorMessage = '🔐 Authentication failed. Please verify your API key is correct.'
          }
        }
        
        setError(errorMessage)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimeout = setTimeout(searchStocks, 500) // Increased debounce for $29 plan
    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  // Filter watchlist items
  const filteredItems = defaultWatchlist.items.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleAddToWatchlist = async (stock: Stock) => {
    try {
      setError(null)
      setIsAddingSymbol(true)
      
      // Fetch fresh data for the stock before adding
      const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(stock.symbol)}`)
      let freshStockData = stock
      
      if (response.ok) {
        const data = await response.json()
        if (data.stock) {
          freshStockData = data.stock
          console.log(`✅ Fetched fresh data for ${stock.symbol}:`, freshStockData)
        }
      } else {
        console.warn(`⚠️ Could not fetch fresh data for ${stock.symbol}, using search data`)
      }
      
      const watchlistItem: WatchlistItem = {
        id: Date.now().toString(),
        symbol: freshStockData.symbol,
        name: freshStockData.name,
        type: 'stock',
        price: freshStockData.price,
        change: freshStockData.change,
        changePercent: freshStockData.changePercent,
        volume: freshStockData.volume,
        sector: freshStockData.sector,
        industry: freshStockData.industry,
        exchange: freshStockData.exchange,
        marketCap: freshStockData.marketCap,
        addedAt: new Date()
      }
      
      await addToWatchlist(defaultWatchlist.id, watchlistItem)
      setSearchQuery('')
      setSearchResults([])
      setIsAddingSymbol(false)
    } catch (error) {
      console.error('Error adding stock to watchlist:', error)
      setIsAddingSymbol(false)
      let errorMessage = `Failed to add ${stock.symbol} to watchlist. Please try again.`
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = `${stock.symbol} is already in your watchlist.`
        } else if (error.message.includes('storage') || error.message.includes('quota')) {
          errorMessage = 'Storage limit reached. Please remove some stocks from your watchlist.'
        }
      }
      
      setError(errorMessage)
    }
  }

  const handleRemoveFromWatchlist = async (itemId: string) => {
    try {
      setError(null)
      await removeFromWatchlist(defaultWatchlist.id, itemId)
    } catch (error) {
      console.error('Error removing stock from watchlist:', error)
      setError('Failed to remove stock from watchlist. Please try again.')
    }
  }

  const refreshWatchlistData = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const { updateWatchlistItem } = useWatchlistStore.getState()
      
      // Refresh data for all watchlist items using multi-source
      const refreshPromises = defaultWatchlist.items.map(async (item) => {
        try {
          const freshData = await multiSourceAPI.getStockData(item.symbol)
          if (freshData && freshData.price > 0) {
            updateWatchlistItem(defaultWatchlist.id, item.id, {
              price: freshData.price,
              change: freshData.change,
              changePercent: freshData.changePercent,
              volume: freshData.volume
            })
            console.log(`✅ Refreshed data for ${item.symbol}: $${freshData.price}`)
          } else {
            console.warn(`⚠️ Could not refresh data for ${item.symbol}`)
          }
        } catch (error) {
          console.error(`Error refreshing data for ${item.symbol}:`, error)
        }
      })
      
      await Promise.all(refreshPromises)
      console.log('✅ Watchlist data refresh completed via multi-source')
    } catch (error) {
      console.error('Error refreshing watchlist data:', error)
      setError('Failed to refresh watchlist data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  // Calculate totals with real-time data
  const totalItems = filteredItems.length
  const averagePrice = totalItems > 0 ? filteredItems.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems : 0
  const totalChange = filteredItems.reduce((sum, item) => sum + (item.change || 0), 0)
  const totalChangePercent = totalItems > 0 ? (totalChange / filteredItems.reduce((sum, item) => sum + ((item.price || 0) - (item.change || 0)), 0)) * 100 : 0
  const gainers = filteredItems.filter(item => (item.changePercent || 0) > 0).length
  const losers = filteredItems.filter(item => (item.changePercent || 0) < 0).length



  return (
    <div className="p-6 space-y-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">US Stock Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite US stocks and monitor their real-time performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={totalChangePercent >= 0 ? 'default' : 'destructive'}
            className="text-sm"
          >
            {totalChangePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {totalChangePercent.toFixed(2)}%
          </Badge>
          {/* Enhanced connection status */}
          <PolygonConnectionStatus showDetails={true} className="text-xs" />
          <Button 
            onClick={refreshWatchlistData}
            disabled={isLoading || defaultWatchlist.items.length === 0}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={() => {
              setIsAddingSymbol(!isAddingSymbol)
              if (!isAddingSymbol) {
                // Focus on search input when opening add mode
                setTimeout(() => {
                  const searchInput = document.querySelector('input[placeholder*="Search US stocks"]') as HTMLInputElement
                  if (searchInput) {
                    searchInput.focus()
                  }
                }, 100)
              }
            }} 
            className="flex items-center space-x-2"
            variant={isAddingSymbol ? "outline" : "default"}
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingSymbol ? 'Cancel' : 'Add Stock'}</span>
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search US stocks (e.g., AAPL, Apple, Tesla)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          
        </div>

        {/* Search Results */}
        {(searchQuery.length > 0 || isAddingSymbol) && searchQuery.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Search Results for "{searchQuery}"
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground font-normal">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </span>
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stock.symbol[0]}</span>
                          </div>
                          <div>
                            <div className="font-semibold">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">{stock.name}</div>
                            <div className="text-xs text-muted-foreground">{stock.exchange}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-semibold">${stock.price.toFixed(2)}</div>
                        <div className={`text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            setLoadingStocks(prev => new Set(prev).add(stock.symbol))
                            await handleAddToWatchlist(stock)
                          } finally {
                            setLoadingStocks(prev => {
                              const newSet = new Set(prev)
                              newSet.delete(stock.symbol)
                              return newSet
                            })
                          }
                        }}
                        disabled={defaultWatchlist.items.some(item => item.symbol === stock.symbol) || loadingStocks.has(stock.symbol)}
                        variant={defaultWatchlist.items.some(item => item.symbol === stock.symbol) ? "outline" : "default"}
                      >
                        {loadingStocks.has(stock.symbol) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : defaultWatchlist.items.some(item => item.symbol === stock.symbol) ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  {error ? (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-medium">No stocks found for "{searchQuery}"</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">Try these popular stocks:</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {isLoadingPopular ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading popular stocks...
                      </div>
                    ) : (
                      ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'PFE', 'FORD', 'IBM', 'GE', 'ZOOM'].map((symbol) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(symbol)}
                          className="text-xs"
                        >
                          {symbol}
                        </Button>
                      ))
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Universal Search:</strong> Search by symbol (AAPL) or company name (Apple)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Stock Helper */}
        {isAddingSymbol && searchQuery.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Search for US Stocks</h3>
              <p className="text-muted-foreground mb-4">
                Start typing to search for stocks by symbol, company name, or sector
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>Popular searches: <strong>AAPL</strong>, <strong>Tesla</strong>, <strong>Microsoft</strong>, <strong>IBM</strong></div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 text-xs">
                  🚀 <strong>NEW:</strong> Search ANY US stock - now powered by Polygon.io API!
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Watchlist Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">US stocks tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gainers}</div>
            <p className="text-xs text-muted-foreground">Up today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{losers}</div>
            <p className="text-xs text-muted-foreground">Down today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per stock</p>
          </CardContent>
        </Card>
      </motion.div>





      {/* Watchlist Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Watchlist ({totalItems})</h2>
          {isConnectedToRealTime && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          )}
        </div>
        
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg font-bold">{item.symbol}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {item.exchange}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm mt-1 line-clamp-2">
                          {item.name}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWatchlist(item.id)}
                        className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all h-8 w-8 p-0"
                        title="Remove from watchlist"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Price Display */}
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.changePercent >= 0 ? '+' : ''}{item.change.toFixed(2)}
                            </div>
                            <div className={`text-xs ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Vol: {item.volume ? item.volume.toLocaleString() : 'N/A'}</span>
                          <span>{item.exchange}</span>
                        </div>
                        
                        {/* Real-time indicator */}
                        {isConnectedToRealTime && (
                          <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Live</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No stocks found' : 'No stocks in watchlist'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery 
                  ? 'Try adjusting your search' 
                  : 'Add some US stocks to start tracking their performance'
                }
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setIsAddingSymbol(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Stock
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
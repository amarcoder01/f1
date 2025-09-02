'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Filter, TrendingUp, TrendingDown, Star, RefreshCw, Loader2, Check, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceTicker } from '@/components/trading/price-ticker'
import { searchStocks as multiSourceSearchStocks, getStockData } from '@/lib/multi-source-api'
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
    stopRealTimeUpdates,
    isHydrated,
    setHydrated
  } = useWatchlistStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])  
  const [isSearching, setIsSearching] = useState(false)
  const [isAddingSymbol, setIsAddingSymbol] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPopular, setIsLoadingPopular] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set())
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [hideInfoMessage, setHideInfoMessage] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState<string | false>(false)

  // Get or create default watchlist
  const defaultWatchlist = watchlists?.find(w => w.name === 'My Watchlist') || {
    id: 'default',
    name: 'My Watchlist',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Handle hydration on client side
  useEffect(() => {
    // Mark as hydrated after component mounts on client
    if (typeof window !== 'undefined') {
      setHydrated(true)
      
      // Check if info message should be hidden
      const hideInfo = localStorage.getItem('hideWatchlistInfo')
      if (hideInfo === 'true') {
        setHideInfoMessage(true)
      }
    }
  }, [setHydrated])

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
    if (defaultWatchlist?.items?.length > 0 && !storeLoading) {
      // Small delay to ensure store is fully loaded
      const timer = setTimeout(() => {
        validateAndFixWatchlistSymbols()
        refreshWatchlistData()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [defaultWatchlist?.items?.length, storeLoading])

  // Function to validate and fix invalid symbols (without removing)
  const validateAndFixWatchlistSymbols = async () => {
    try {
      const { updateWatchlistItem } = useWatchlistStore.getState()
      
      // Check if defaultWatchlist exists and has items
      if (!defaultWatchlist?.items?.length) {
        return
      }
      
      // Common symbol corrections
      const symbolCorrections: { [key: string]: string } = {
        'APPL': 'AAPL',
        'GOOG': 'GOOGL',
        'MSFT': 'MSFT', // Already correct
        'TSLA': 'TSLA', // Already correct
        'AMZN': 'AMZN', // Already correct
        'PFE': 'PFE'    // Already correct
      }
      
      for (const item of defaultWatchlist?.items || []) {
        // Check if symbol needs correction
        if (symbolCorrections[item.symbol]) {
          const correctSymbol = symbolCorrections[item.symbol]
          
          // Test if the corrected symbol works
          try {
            const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(correctSymbol)}`)
            if (response.ok) {
              const data = await response.json()
              if (data.stock && data.stock.price > 0) {
                // Update the symbol and data
                updateWatchlistItem(defaultWatchlist?.id || 'default', item.id, {
                  symbol: correctSymbol,
                  name: data.stock.name,
                  price: data.stock.price,
                  change: data.stock.change,
                  changePercent: data.stock.changePercent,
                  volume: data.stock.volume
                })
                console.log(`✅ Fixed symbol ${item.symbol} → ${correctSymbol}`)
              }
            }
          } catch (error) {
            console.error(`Error fixing symbol ${item.symbol}:`, error)
          }
        }
        
        // Note: Removed automatic removal logic to prevent stocks from being deleted
        // Users can manually remove stocks if needed
      }
    } catch (error) {
      console.error('Error validating watchlist symbols:', error)
    }
  }

  // If no default watchlist exists, create one
  useEffect(() => {
    if (watchlists?.length === 0 && !storeLoading) {
      createWatchlist('My Watchlist')
    }
  }, [watchlists, createWatchlist, storeLoading])

  // Start real-time updates for watchlist items using multi-source
  useEffect(() => {
    if (defaultWatchlist?.items?.length > 0) {
      const symbols = defaultWatchlist?.items?.map(item => item.symbol) || []
      
      // Set up periodic updates for all symbols
      const updateInterval = setInterval(async () => {
        try {
          const { updateWatchlistItem } = useWatchlistStore.getState()
          
          // Update each symbol with fresh data from multi-source
          for (const symbol of symbols) {
            try {
              const freshData = await getStockData(symbol)
              if (freshData && freshData.price > 0) {
                const existingItem = defaultWatchlist?.items?.find(item => item.symbol === symbol)
                if (existingItem) {
                  updateWatchlistItem(defaultWatchlist?.id || 'default', existingItem.id, {
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
  }, [defaultWatchlist?.items])

  // Start real-time updates when watchlist has items
  useEffect(() => {
    if (defaultWatchlist && defaultWatchlist?.items?.length > 0 && !isConnectedToRealTime) {
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

  // Enhanced search functionality using yfinance API
  useEffect(() => {
    const searchStocks = async () => {
      if (!searchQuery || searchQuery.length < 1) {
        setSearchResults([])
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
      setError(null)
      
      try {
        console.log(`🔍 Searching for: "${searchQuery}"`)
        
        // Use the yfinance API route for real-time data
        const searchUrl = `/api/stocks/yfinance-search?q=${encodeURIComponent(searchQuery)}`
        console.log(`📡 Making request to: ${searchUrl}`)
        
        const response = await fetch(searchUrl)
        
        console.log(`📡 Response status: ${response.status}`)
        console.log(`📡 Response ok: ${response.ok}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ API Error Response: ${errorText}`)
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`📊 yfinance Search API response:`, data)
        
        const results = data.results || []
        setSearchResults(results)
        
        if (results.length === 0) {
          setError(`No stocks found for "${searchQuery}". Try searching with a different term.`)
        } else {
          console.log(`✅ Found ${results.length} stocks for "${searchQuery}" using real-time data`)
        }
      } catch (error) {
        console.error('❌ Error searching stocks:', error)
        let errorMessage = 'Search failed. Please check your internet connection.'
        
        if (error instanceof Error) {
          if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = `📊 No stock data found for "${searchQuery}". Please check the symbol and try again.`
          } else if (error.message.includes('server error') || error.message.includes('500')) {
            errorMessage = '🔧 Search service is temporarily unavailable. Please try again later.'
          } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorMessage = '🌐 Network error. Please check your internet connection.'
          } else if (error.message.includes('timeout')) {
            errorMessage = '⏱️ Request timed out. Please try again with a shorter search term.'
          }
        }
        
        setError(errorMessage)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimeout = setTimeout(searchStocks, 300) // Reduced debounce for better UX
    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  // Filter watchlist items
  const filteredItems = defaultWatchlist?.items?.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }) || []

  const handleAddToWatchlist = async (stock: Stock) => {
    try {
      setError(null)
      setIsAddingSymbol(true)
      
      console.log(`🔍 Starting to add ${stock.symbol} to watchlist...`)
      console.log(`📊 Stock data:`, stock)
      
      // Use the search data directly since it's already validated
      // The search API already provides valid stock data
      console.log(`✅ Adding ${stock.symbol} to watchlist with search data:`, stock)
      
      // Validate that we have the minimum required data
      if (!stock.symbol || !stock.name || !stock.price || stock.price <= 0) {
        console.error(`❌ Invalid stock data for ${stock.symbol}:`, {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price
        })
        throw new Error(`Invalid stock data for ${stock.symbol}`)
      }
      
      const watchlistItem: WatchlistItem = {
        id: Date.now().toString(),
        symbol: stock.symbol,
        name: stock.name,
        type: 'stock',
        price: stock.price,
        change: stock.change || 0,
        changePercent: stock.changePercent || 0,
        volume: stock.volume || 0,
        sector: stock.sector || 'Technology',
        industry: stock.industry || 'Technology',
        exchange: stock.exchange || 'NASDAQ',
        marketCap: stock.marketCap || 0,
        addedAt: new Date()
      }
      
      console.log(`📝 Created watchlist item:`, watchlistItem)
      
      await addToWatchlist(defaultWatchlist?.id || 'default', watchlistItem)
      setSearchQuery('')
      setSearchResults([])
      setIsAddingSymbol(false)
      console.log(`✅ Successfully added ${stock.symbol} to watchlist`)
          } catch (error) {
        console.error('❌ Error adding stock to watchlist:', error)
        setIsAddingSymbol(false)
        let errorMessage = `Failed to add ${stock.symbol} to watchlist. Please try again.`
        
        if (error instanceof Error) {
          console.error('❌ Error details:', error.message)
          if (error.message.includes('Invalid stock data')) {
            errorMessage = `${stock.symbol} has invalid data. Please try searching again.`
          } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
            errorMessage = `${stock.symbol} is already in your watchlist.`
          } else if (error.message.includes('storage') || error.message.includes('quota')) {
            errorMessage = 'Storage limit reached. Please remove some stocks from your watchlist.'
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = `Network error while adding ${stock.symbol}. Please check your connection.`
          } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage = `Server error while adding ${stock.symbol}. Please try again later.`
          } else if (error.message.includes('API Error')) {
            // Extract the specific error message from API Error
            const apiErrorMessage = error.message.replace(/^API Error \d+: /, '')
            errorMessage = `Server error: ${apiErrorMessage}`
          } else if (error.message.includes('Missing required fields')) {
            errorMessage = `Invalid stock data for ${stock.symbol}. Please try searching again.`
          }
        }
        
        setError(errorMessage)
      }
  }

  const handleRemoveFromWatchlist = async (itemId: string) => {
    try {
      setError(null)
      setRemovingItemId(itemId)
      
      console.log(`🗑️ UI: Removing item ${itemId} from watchlist...`)
      
      await removeFromWatchlist(defaultWatchlist?.id || 'default', itemId)
      
      console.log(`✅ UI: Successfully removed item ${itemId} from watchlist`)
      
      // Show success message briefly
      setRefreshSuccess('removed')
      setTimeout(() => {
        setRefreshSuccess(false)
      }, 2000)
      
    } catch (error) {
      console.error('❌ UI: Error removing stock from watchlist:', error)
      
      let errorMessage = 'Failed to remove stock from watchlist. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Stock not found in watchlist. It may have already been removed.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('Failed to remove item')) {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setRemovingItemId(null)
    }
  }

  const refreshWatchlistData = async () => {
    try {
      console.log('🔄 Refresh button clicked')
      setError(null)
      setIsLoading(true)
      
      const { updateWatchlistItem } = useWatchlistStore.getState()
      
      // Check if defaultWatchlist exists and has items
      if (!defaultWatchlist?.items?.length) {
        console.log('⚠️ No items to refresh')
        setIsLoading(false)
        return
      }
      
      console.log(`🔄 Refreshing data for ${defaultWatchlist.items.length} stocks...`)
      console.log('📊 Stocks to refresh:', defaultWatchlist.items.map(item => item.symbol))
      
      // Refresh data for all watchlist items using yfinance API
      const refreshPromises = defaultWatchlist.items.map(async (item) => {
        try {
          console.log(`🔍 Refreshing ${item.symbol}...`)
          
          // Use yfinance API to get fresh data
          const response = await fetch(`/api/stocks/yfinance-search?q=${encodeURIComponent(item.symbol)}`)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`📊 API response for ${item.symbol}:`, data)
            
            const freshData = data.results?.[0] // Get the first (and should be only) result
            
          if (freshData && freshData.price > 0) {
            updateWatchlistItem(defaultWatchlist?.id || 'default', item.id, {
              price: freshData.price,
              change: freshData.change,
              changePercent: freshData.changePercent,
              volume: freshData.volume,
              marketCap: freshData.marketCap,
              sector: freshData.sector,
              industry: freshData.industry
            })
              console.log(`✅ Refreshed data for ${item.symbol}: $${freshData.price} (${freshData.changePercent >= 0 ? '+' : ''}${freshData.changePercent.toFixed(2)}%)`)
          } else {
              console.warn(`⚠️ Could not refresh data for ${item.symbol}: No valid data returned`)
            }
          } else {
            console.error(`❌ Failed to refresh ${item.symbol}: API returned ${response.status}`)
          }
        } catch (error) {
          console.error(`❌ Error refreshing data for ${item.symbol}:`, error)
        }
      })
      
      await Promise.all(refreshPromises)
      console.log('✅ Watchlist data refresh completed via yfinance')
      
      // Show success message
      setError(null)
      setRefreshSuccess('refreshed')
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setRefreshSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('❌ Error refreshing watchlist data:', error)
      setError('Failed to refresh watchlist data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  // Calculate totals with real-time data
  const totalItems = filteredItems?.length || 0
  const averagePrice = totalItems > 0 ? filteredItems.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems : 0
  const totalChange = filteredItems.reduce((sum, item) => sum + (item.change || 0), 0)
  const totalChangePercent = totalItems > 0 ? (totalChange / filteredItems.reduce((sum, item) => sum + ((item.price || 0) - (item.change || 0)), 0)) * 100 : 0
  const gainers = filteredItems.filter(item => (item.changePercent || 0) > 0).length
  const losers = filteredItems.filter(item => (item.changePercent || 0) < 0).length



  // Show loading state while store is initializing
  if (storeLoading || !isHydrated) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    )
  }

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

      {/* Success Message */}
      {refreshSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
              </div>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">
              <strong>Success!</strong> {refreshSuccess === 'removed' ? 'Stock removed from watchlist successfully!' : refreshSuccess === 'refreshed' ? 'All stock data has been updated with the latest prices.' : 'Operation completed successfully!'}
            </p>
            <button 
              onClick={() => setRefreshSuccess(false)}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Info Message */}
      {defaultWatchlist?.items?.length > 0 && !hideInfoMessage && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">i</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Watchlist Management:</strong> Your stocks are now safe and won't be automatically removed. 
                You can manually remove any stock by clicking the remove button next to it.
              </p>
            </div>
            <button 
              onClick={() => {
                // Hide the message by setting a flag in localStorage
                localStorage.setItem('hideWatchlistInfo', 'true')
                setHideInfoMessage(true)
              }}
              className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
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
          <h1 className="text-3xl font-bold tracking-tight">Stock Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite stocks and monitor their real-time performance
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
          <Button 
            onClick={refreshWatchlistData}
            disabled={isLoading || !defaultWatchlist?.items?.length}
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
                  const searchInput = document.querySelector('input[placeholder*="Search stocks"]') as HTMLInputElement
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
              placeholder="Search stocks (e.g., AAPL, Apple, Tesla)..."
              value={searchQuery}
              onChange={(e) => {
                console.log(`🔍 Search input changed: "${e.target.value}"`)
                setSearchQuery(e.target.value)
              }}
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
        {searchQuery.length > 0 && (
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
                // Show search results
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
                                                  disabled={defaultWatchlist?.items?.some(item => item.symbol === stock.symbol) || loadingStocks.has(stock.symbol)}
                        variant={defaultWatchlist?.items?.some(item => item.symbol === stock.symbol) ? "outline" : "default"}
                        >
                          {loadingStocks.has(stock.symbol) ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Adding...
                            </>
                          ) : defaultWatchlist?.items?.some(item => item.symbol === stock.symbol) ? (
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
                      {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'].map((symbol) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(symbol)}
                          className="text-xs"
                        >
                          {symbol}
                        </Button>
                      ))}
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

        {/* Popular Stocks Section */}
        {searchQuery.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Popular Stocks</span>
                </div>
                <span className="text-sm text-muted-foreground font-normal">
                  Click to search
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { symbol: 'AAPL', name: 'Apple Inc.', color: 'from-blue-500 to-blue-600' },
                  { symbol: 'MSFT', name: 'Microsoft', color: 'from-green-500 to-green-600' },
                  { symbol: 'GOOGL', name: 'Alphabet', color: 'from-red-500 to-red-600' },
                  { symbol: 'TSLA', name: 'Tesla', color: 'from-purple-500 to-purple-600' },
                  { symbol: 'NVDA', name: 'NVIDIA', color: 'from-green-600 to-green-700' },
                  { symbol: 'AMZN', name: 'Amazon', color: 'from-orange-500 to-orange-600' },
                  { symbol: 'META', name: 'Meta', color: 'from-blue-600 to-blue-700' },
                  { symbol: 'NFLX', name: 'Netflix', color: 'from-red-600 to-red-700' },
                  { symbol: 'JPM', name: 'JPMorgan', color: 'from-blue-700 to-blue-800' },
                  { symbol: 'JNJ', name: 'Johnson & Johnson', color: 'from-red-700 to-red-800' },
                  { symbol: 'PG', name: 'Procter & Gamble', color: 'from-blue-800 to-blue-900' },
                  { symbol: 'UNH', name: 'UnitedHealth', color: 'from-green-700 to-green-800' }
                  ].map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => setSearchQuery(stock.symbol)}
                    className="group flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${stock.color} rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow`}>
                            <span className="text-white font-bold text-sm">{stock.symbol[0]}</span>
                          </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {stock.symbol}
                          </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {stock.name}
                        </div>
                      </div>
                  </button>
                ))}
                    </div>
              
              {/* Additional popular stocks in a horizontal scroll */}
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-2">More Popular Stocks:</div>
                <div className="flex flex-wrap gap-2">
                  {['HD', 'MA', 'V', 'PYPL', 'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL', 'CSCO', 'IBM', 'QCOM'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchQuery(symbol)}
                      className="px-3 py-1 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
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
            <p className="text-xs text-muted-foreground">Stocks tracked</p>
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
                        disabled={removingItemId === item.id}
                        className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all h-8 w-8 p-0 disabled:opacity-50"
                        title="Remove from watchlist"
                      >
                        {removingItemId === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
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
                  : 'Add some stocks to start tracking their performance'
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
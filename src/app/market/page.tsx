'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Filter,
  RefreshCw,
  Star,
  Eye,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Volume2,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { YahooFinanceChart } from '@/components/charts/YahooFinanceChart'
import { MarketOverview } from '@/components/dashboard/MarketAnalysis'
import { NewsItem } from '@/types'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  sector: string
  industry: string
  exchange: string
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
}



interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

interface ScreenerStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  sector: string
  industry: string
  exchange: string
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  avgVolume: number
  dividendYield?: number
  beta?: number
}

interface ScreenerFilters {
  marketCap: string
  sector: string
  priceMin: string
  priceMax: string
  peRatio: string
  volume: string
  performance: string
}

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'screener'>('overview')
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [screenerStocks, setScreenerStocks] = useState<ScreenerStock[]>([])
  const [screenerFilters, setScreenerFilters] = useState<ScreenerFilters>({
    marketCap: 'Any',
    sector: 'Any',
    priceMin: '',
    priceMax: '',
    peRatio: 'Any',
    volume: 'Any',
    performance: 'Any'
  })
  const [isScreenerLoading, setIsScreenerLoading] = useState(false)
  const [isRealTimeData, setIsRealTimeData] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Sample market indices data
  const sampleIndices: MarketIndex[] = [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      price: 4567.89,
      change: 23.45,
      changePercent: 0.52,
      volume: 2345678901
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ',
      price: 14234.56,
      change: -45.67,
      changePercent: -0.32,
      volume: 3456789012
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      price: 34567.89,
      change: 123.45,
      changePercent: 0.36,
      volume: 1234567890
    }
  ]

  // Sample news data
  const sampleNews: NewsItem[] = [
    {
      id: '1',
      title: 'Tech Stocks Rally on Strong Earnings Reports',
      summary: 'Major technology companies report better-than-expected quarterly results, driving market gains.',
      content: 'Major technology companies including Apple, Microsoft, and Google reported better-than-expected quarterly results, driving significant market gains across the tech sector. The strong performance was attributed to robust cloud computing demand and improved consumer spending patterns.',
      source: 'Financial Times',
      publishedAt: new Date('2024-01-15T10:30:00Z'),
      url: '#',
      symbols: ['AAPL', 'MSFT', 'GOOGL'],
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'Federal Reserve Signals Potential Rate Cuts',
      summary: 'Central bank officials hint at possible interest rate reductions in coming months.',
      content: 'Federal Reserve officials have signaled potential interest rate reductions in the coming months, citing improved inflation data and economic stability. This dovish stance has been welcomed by equity markets and could provide support for continued economic growth.',
      source: 'Wall Street Journal',
      publishedAt: new Date('2024-01-15T09:15:00Z'),
      url: '#',
      symbols: ['SPY', 'QQQ', 'IWM'],
      sentiment: 'positive'
    },
    {
      id: '3',
      title: 'Oil Prices Decline on Supply Concerns',
      summary: 'Crude oil futures fall as global supply increases and demand concerns persist.',
      content: 'Crude oil futures experienced a significant decline as global supply increases and demand concerns persist. The market is responding to reports of increased production from major oil-producing nations and concerns about global economic growth.',
      source: 'Reuters',
      publishedAt: new Date('2024-01-15T08:45:00Z'),
      url: '#',
      symbols: ['USO', 'XOM', 'CVX'],
      sentiment: 'negative'
    }
  ]

  // Search stocks
  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setSearchResults([]) // Clear previous results
    
    try {
      console.log(`🔍 Searching for: ${query}`)
      
      // Use the real stock search API
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Search API response:', data)
      
      const results = data.data || data.results || []
      
      if (results.length === 0) {
        console.log('No search results found')
        setSearchResults([])
        return
      }
      
      // Convert to StockData format
      const stockResults: StockData[] = results.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name || stock.companyName || `${stock.symbol} Corporation`,
        price: stock.price || stock.close || stock.currentPrice || 0,
        change: stock.change || stock.changeAmount || stock.priceChange || 0,
        changePercent: stock.changePercent || stock.changePercent || 0,
        volume: stock.volume || stock.tradingVolume || 0,
        marketCap: stock.marketCap || stock.marketCapitalization || 0,
        pe: stock.pe || stock.peRatio || stock.priceToEarnings || 0,
        sector: stock.sector || 'Unknown',
        industry: stock.industry || 'Unknown',
        exchange: stock.exchange || stock.primaryExchange || 'NASDAQ',
        dayHigh: stock.dayHigh || stock.high || stock.price || 0,
        dayLow: stock.dayLow || stock.low || stock.price || 0,
        fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh || stock.yearHigh || stock.price || 0,
      }))
      
      console.log(`✅ Found ${stockResults.length} stocks:`, stockResults)
      setSearchResults(stockResults)
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5)
        return newHistory
      })
      
    } catch (error) {
      console.error('Search error:', error)
      
      // Enhanced fallback with better mock data
      const fallbackResults: StockData[] = [
        {
          symbol: query.toUpperCase(),
          name: `${query.toUpperCase()} Corporation`,
          price: Math.random() * 500 + 50,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.random() * 10000000,
          marketCap: Math.random() * 1000000000000,
          pe: Math.random() * 50 + 10,
          sector: 'Technology',
          industry: 'Software',
          exchange: 'NASDAQ',
          dayHigh: Math.random() * 500 + 50,
          dayLow: Math.random() * 500 + 50,
          fiftyTwoWeekHigh: Math.random() * 500 + 50,
        }
      ]
      
      console.log('Using fallback data:', fallbackResults)
      setSearchResults(fallbackResults)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search for real-time search
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query)
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // If query is empty, clear results
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      if (query.trim().length >= 2) { // Only search if 2+ characters
        handleSearch(query)
      }
    }, 500) // 500ms delay
    
    setSearchTimeout(newTimeout)
  }



  // Fetch market overview data
  const fetchMarketOverview = async () => {
    try {
      const response = await fetch('/api/market/overview')
      if (response.ok) {
        const data = await response.json()
        setMarketIndices(data.indices || sampleIndices)
      } else {
        setMarketIndices(sampleIndices)
      }
    } catch (error) {
      console.error('Error fetching market overview:', error)
      setMarketIndices(sampleIndices)
    }
  }

  // Fetch screener data
  const fetchScreenerData = async (filters: ScreenerFilters) => {
    setIsScreenerLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'Any') {
          params.append(key, value)
        }
      })
      
      const response = await fetch(`/api/market/screener?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setScreenerStocks(data.stocks || [])
        setIsRealTimeData(data.isRealTime || false)
        console.log(`📊 Screener loaded ${data.stocks?.length || 0} stocks (Real-time: ${data.isRealTime})`)
      } else {
        setScreenerStocks([])
        setIsRealTimeData(false)
      }
    } catch (error) {
      console.error('Error fetching screener data:', error)
      setScreenerStocks([])
      setIsRealTimeData(false)
    } finally {
      setIsScreenerLoading(false)
    }
  }

  const handleScreenerFilterChange = (filter: keyof ScreenerFilters, value: string) => {
    setScreenerFilters(prev => ({
      ...prev,
      [filter]: value
    }))
  }

  const handleApplyFilters = () => {
    fetchScreenerData(screenerFilters)
  }

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('marketSearchHistory')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
    
    fetchMarketOverview()
    setIsLoading(false)
  }, [])

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('marketSearchHistory', JSON.stringify(searchHistory))
    }
  }, [searchHistory])

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: BarChart3 },
    { id: 'search', label: 'Stock Search', icon: Search },
    { id: 'screener', label: 'Screener', icon: Filter }
  ]



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading Market Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
      <div className="border-b border-purple-800/50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Market Explorer
                </h1>
            </div>
              <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Live Data
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                onClick={() => {
                  fetchMarketOverview()
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-purple-800/50 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
        <motion.div
              key="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Market Indices */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketIndices.map((index) => (
                  <motion.div
                    key={index.symbol}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-black/20 border-purple-800/30 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white">{index.name}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`${
                              index.changePercent >= 0 
                                ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                                : 'border-red-500/30 text-red-400 bg-red-500/10'
                            }`}
                          >
                            {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                          </Badge>
                        </div>
            </CardHeader>
            <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">
                              ${index.price.toLocaleString()}
                            </span>
                            <div className={`flex items-center space-x-1 ${
                              index.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {index.change >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                              </span>
                            </div>
              </div>
                          <div className="text-xs text-gray-400">
                            Volume: {(index.volume / 1e9).toFixed(1)}B
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
            ))}
          </div>

              {/* Market Analysis Component */}
              <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span>Market Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <MarketOverview />
                </CardContent>
              </Card>

              {/* Default Market Chart */}
              <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span>Market Overview Chart (SPY)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <YahooFinanceChart 
                    symbol="SPY" 
                    interval="1d"
                    range="1mo"
                    width={400}
                    height={250} 
                    theme="dark"
                    chartType="line"
                    showControls={false}
                  />
                </CardContent>
              </Card>
              </motion.div>
            )}

          {/* Stock Search Tab */}
          {activeTab === 'search' && (
              <motion.div
              key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
                className="space-y-6"
              >
              {/* Search Bar */}
              <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                      placeholder="Search for stocks, companies, or symbols..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                      className="pl-10 bg-black/30 border-purple-800/50 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                <Button 
                  onClick={() => handleSearch(searchQuery)}
                      disabled={isSearching}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
                >
                  {isSearching ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
                </CardContent>
              </Card>

              {/* Quick Search Suggestions */}
              {!searchQuery && !isSearching && (
                <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span>Popular Stocks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'].map((symbol) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearch(symbol)}
                          className="text-gray-300 hover:text-white border-gray-600 hover:border-purple-500 hover:bg-purple-500/10"
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && !searchQuery && (
                <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span>Recent Searches</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query) => (
                        <Button
                          key={query}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearch(query)}
                          className="text-gray-300 hover:text-white border-gray-600 hover:border-purple-500 hover:bg-purple-500/10"
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search Loading and Results */}
              {isSearching && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-400 text-lg">Searching...</span>
                </div>
              )}
              
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-lg mb-2">No stocks found</div>
                  <div className="text-gray-500">Try searching for a different symbol or company name</div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Search Results ({searchResults.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchResults([])
                        setSearchQuery('')
                      }}
                      className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-500"
                    >
                      Clear Results
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.map((stock) => (
                    <motion.div
                      key={stock.symbol}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <Card className="bg-black/20 border-purple-800/30 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white">{stock.symbol}</CardTitle>
                              <CardDescription className="text-gray-400">{stock.name}</CardDescription>
                            </div>
                            <Badge 
                      variant="outline"
                              className={`${
                                stock.changePercent >= 0 
                                  ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                                  : 'border-red-500/30 text-red-400 bg-red-500/10'
                              }`}
                            >
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-white">
                                ${stock.price.toFixed(2)}
                              </span>
                              <div className={`flex items-center space-x-1 ${
                                stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {stock.change >= 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                <span className="text-sm">
                                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                                </span>
                        </div>
                      </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Volume:</span>
                                <span className="text-white ml-2">{(stock.volume / 1e6).toFixed(1)}M</span>
                      </div>
                              <div>
                                <span className="text-gray-400">Market Cap:</span>
                                <span className="text-white ml-2">${(stock.marketCap / 1e9).toFixed(1)}B</span>
                      </div>
                              <div>
                                <span className="text-gray-400">P/E:</span>
                                <span className="text-white ml-2">{stock.pe.toFixed(1)}</span>
                      </div>
                              <div>
                                <span className="text-gray-400">Sector:</span>
                                <span className="text-white ml-2">{stock.sector}</span>
                        </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
                                ))}
                  </div>
                </div>
              )}

                            {/* Selected Stock Details */}
              {selectedStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                  {/* Stock Header */}
                  <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{selectedStock.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <CardTitle className="text-white text-2xl">{selectedStock.symbol}</CardTitle>
                            <CardDescription className="text-gray-400">{selectedStock.name}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                            {selectedStock.exchange}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 text-purple-300"
                            onClick={() => setSelectedStock(null)}
                          >
                            Close
                        </Button>
                      </div>
                    </div>
                    </CardHeader>
                  </Card>

                  {/* Price and Chart Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Price Information */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                          <span>Price Information</span>
                        </CardTitle>
                  </CardHeader>
                  <CardContent>
                        <div className="space-y-4">
                      <div className="text-center">
                            <div className="text-3xl font-bold text-white">
                              ${selectedStock.price.toFixed(2)}
                        </div>
                            <div className={`flex items-center justify-center space-x-2 mt-2 ${
                              selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {selectedStock.change >= 0 ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : (
                                <TrendingDown className="w-5 h-5" />
                              )}
                              <span className="text-lg font-semibold">
                                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                              </span>
                              <span className="text-sm">
                                ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                              </span>
                      </div>
                    </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Day High:</span>
                              <span className="text-white">${selectedStock.dayHigh.toFixed(2)}</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Day Low:</span>
                              <span className="text-white">${selectedStock.dayLow.toFixed(2)}</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">52W High:</span>
                              <span className="text-white">${selectedStock.fiftyTwoWeekHigh.toFixed(2)}</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Volume:</span>
                              <span className="text-white">{(selectedStock.volume / 1e6).toFixed(1)}M</span>
                        </div>
                      </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <span>Key Metrics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Market Cap:</span>
                              <span className="text-white">${(selectedStock.marketCap / 1e9).toFixed(1)}B</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">P/E Ratio:</span>
                              <span className="text-white">{selectedStock.pe.toFixed(1)}</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sector:</span>
                              <span className="text-white">{selectedStock.sector}</span>
                        </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Industry:</span>
                              <span className="text-white">{selectedStock.industry}</span>
                      </div>
                        </div>
                          
                          <div className="pt-4 border-t border-purple-800/30">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                ${(selectedStock.marketCap / 1e9).toFixed(1)}B
                        </div>
                              <div className="text-sm text-gray-400">Market Cap</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                    {/* Trading Actions */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          <span>Trading Actions</span>
                      </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Buy {selectedStock.symbol}
                          </Button>
                          <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                            <TrendingDown className="w-4 h-4 mr-2" />
                            Sell {selectedStock.symbol}
                          </Button>
                          <Button variant="outline" className="w-full border-purple-500/30 text-purple-300">
                            <Eye className="w-4 h-4 mr-2" />
                            Add to Watchlist
                          </Button>
                          <Button variant="outline" className="w-full border-purple-500/30 text-purple-300">
                            <Star className="w-4 h-4 mr-2" />
                            Set Alert
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                    </div>

                  {/* Chart Section */}
                  <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <LineChart className="w-5 h-5 text-purple-400" />
                        <span>{selectedStock.symbol} Enhanced Chart</span>
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <YahooFinanceChart
                      symbol={selectedStock.symbol}
                      interval="1d"
                      range="1mo"
                      width={600}
                      height={300}
                      theme="dark"
                      chartType="line"
                      showControls={false}
                    />
                  </CardContent>
                </Card>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Information */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Building2 className="w-5 h-5 text-purple-400" />
                          <span>Company Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Company Name:</span>
                            <span className="text-white">{selectedStock.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Exchange:</span>
                            <span className="text-white">{selectedStock.exchange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sector:</span>
                            <span className="text-white">{selectedStock.sector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Industry:</span>
                            <span className="text-white">{selectedStock.industry}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Analysis */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <PieChart className="w-5 h-5 text-purple-400" />
                          <span>Technical Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">RSI (14):</span>
                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                              65.2
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">MACD:</span>
                            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                              Bearish
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Moving Average:</span>
                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                              Above 50MA
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Support Level:</span>
                            <span className="text-white text-sm">${(selectedStock.price * 0.95).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Resistance Level:</span>
                            <span className="text-white text-sm">${(selectedStock.price * 1.05).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stock Chart */}
                    <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          <span>Price Chart</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                        <YahooFinanceChart
                          symbol={selectedStock.symbol}
                          interval="1d"
                          range="1mo"
                          width={400}
                          height={250}
                          theme="dark"
                          chartType="line"
                          showControls={false}
                        />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
              </motion.div>
            )}



            {/* Stock Screener Tab */}
            {activeTab === 'screener' && (
              <motion.div
                key="screener"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-purple-400" />
                      <span>Stock Screener</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Filter stocks by various criteria and find your next investment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Market Cap Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Market Cap</label>
                        <select 
                          className="w-full bg-black/30 border-purple-800/50 text-white rounded-md px-3 py-2"
                          value={screenerFilters.marketCap}
                          onChange={(e) => handleScreenerFilterChange('marketCap', e.target.value)}
                        >
                          <option>Any</option>
                          <option>Large Cap ($10B+)</option>
                          <option>Mid Cap ($2B-$10B)</option>
                          <option>Small Cap ($300M-$2B)</option>
                        </select>
                      </div>

                      {/* Sector Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Sector</label>
                        <select 
                          className="w-full bg-black/30 border-purple-800/50 text-white rounded-md px-3 py-2"
                          value={screenerFilters.sector}
                          onChange={(e) => handleScreenerFilterChange('sector', e.target.value)}
                        >
                          <option>Any</option>
                          <option>Technology</option>
                          <option>Healthcare</option>
                          <option>Financial</option>
                          <option>Energy</option>
                          <option>Consumer Discretionary</option>
                          <option>Consumer Staples</option>
                          <option>Industrial</option>
                          <option>Materials</option>
                          <option>Real Estate</option>
                          <option>Utilities</option>
                        </select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Price Range</label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Min"
                            className="bg-black/30 border-purple-800/50 text-white"
                            value={screenerFilters.priceMin}
                            onChange={(e) => handleScreenerFilterChange('priceMin', e.target.value)}
                          />
                          <Input
                            placeholder="Max"
                            className="bg-black/30 border-purple-800/50 text-white"
                            value={screenerFilters.priceMax}
                            onChange={(e) => handleScreenerFilterChange('priceMax', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* P/E Ratio */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">P/E Ratio</label>
                        <select 
                          className="w-full bg-black/30 border-purple-800/50 text-white rounded-md px-3 py-2"
                          value={screenerFilters.peRatio}
                          onChange={(e) => handleScreenerFilterChange('peRatio', e.target.value)}
                        >
                          <option>Any</option>
                          <option>Under 15</option>
                          <option>15-25</option>
                          <option>Over 25</option>
                        </select>
                      </div>

                      {/* Volume */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Volume</label>
                        <select 
                          className="w-full bg-black/30 border-purple-800/50 text-white rounded-md px-3 py-2"
                          value={screenerFilters.volume}
                          onChange={(e) => handleScreenerFilterChange('volume', e.target.value)}
                        >
                          <option>Any</option>
                          <option>High Volume</option>
                          <option>Medium Volume</option>
                          <option>Low Volume</option>
                        </select>
                      </div>

                      {/* Performance */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Performance</label>
                        <select 
                          className="w-full bg-black/30 border-purple-800/50 text-white rounded-md px-3 py-2"
                          value={screenerFilters.performance}
                          onChange={(e) => handleScreenerFilterChange('performance', e.target.value)}
                        >
                          <option>Any</option>
                          <option>Top Gainers</option>
                          <option>Top Losers</option>
                          <option>Most Active</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center space-x-4">
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 px-8"
                        onClick={handleApplyFilters}
                        disabled={isScreenerLoading}
                      >
                        {isScreenerLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Apply Filters'
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                        onClick={() => {
                          setScreenerFilters({
                            marketCap: 'Any',
                            sector: 'Any',
                            priceMin: '',
                            priceMax: '',
                            peRatio: 'Any',
                            volume: 'Any',
                            performance: 'Any'
                          })
                          fetchScreenerData({
                            marketCap: 'Any',
                            sector: 'Any',
                            priceMin: '',
                            priceMax: '',
                            peRatio: 'Any',
                            volume: 'Any',
                            performance: 'Any'
                          })
                        }}
                        disabled={isScreenerLoading}
                      >
                        Load All Stocks
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Screener Results */}
                {screenerStocks.length > 0 && (
                  <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span>Screener Results ({screenerStocks.length} stocks)</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${isRealTimeData ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse mr-1 ${isRealTimeData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            {isRealTimeData ? 'Live Data' : 'Cached Data'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                            onClick={() => fetchScreenerData(screenerFilters)}
                            disabled={isScreenerLoading}
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${isScreenerLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {screenerStocks.map((stock, index) => (
                          <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-lg border border-purple-800/30 hover:border-purple-500/50 transition-all duration-300 bg-black/10 cursor-pointer"
                            onClick={() => {
                              setSearchQuery(stock.symbol)
                              setActiveTab('search')
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h3 className="text-white font-medium">{stock.symbol}</h3>
                                    <p className="text-gray-400 text-sm">{stock.name}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                                      {stock.sector}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                      {stock.exchange}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-6 mt-2 text-sm">
                                  <div>
                                    <span className="text-white font-medium">${stock.price}</span>
                                    <span className={`ml-2 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                                    </span>
                                  </div>
                                  <div className="text-gray-400">
                                    <span>P/E: {stock.pe.toFixed(1)}</span>
                                  </div>
                                  <div className="text-gray-400">
                                    <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                                  </div>
                                  <div className="text-gray-400">
                                    <span>Mkt Cap: ${(stock.marketCap / 1000000000).toFixed(1)}B</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Results */}
                {screenerStocks.length === 0 && !isScreenerLoading && (
                  <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
                    <CardContent className="text-center py-8">
                      <div className="text-gray-400">
                        <Filter className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <p className="text-lg font-medium">No stocks match your criteria</p>
                        <p className="text-sm">Try adjusting your filters to find more results</p>
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            className="border-purple-500/30 text-purple-300"
                            onClick={() => {
                              setScreenerFilters({
                                marketCap: 'Any',
                                sector: 'Any',
                                priceMin: '',
                                priceMax: '',
                                peRatio: 'Any',
                                volume: 'Any',
                                performance: 'Any'
                              })
                              fetchScreenerData({
                                marketCap: 'Any',
                                sector: 'Any',
                                priceMin: '',
                                priceMax: '',
                                peRatio: 'Any',
                                volume: 'Any',
                                performance: 'Any'
                              })
                            }}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}

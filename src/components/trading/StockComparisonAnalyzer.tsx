"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Search, 
  Plus, 
  X, 
  Loader2, 
  Download,
  Share2,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Activity,
  PieChart,
  LineChart,
  Zap,
  Globe,
  Building2,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Settings,
  Eye,
  RefreshCw
} from 'lucide-react'
import { PriceChart, ComparisonChart, TechnicalIndicatorsChart, VolumeAnalysisChart } from '@/components/charts/AdvancedStockCharts'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  pe: number
  volume: number
  dividendYield: number
  beta: number
  high52Week: number
  low52Week: number
  sector: string
  industry: string
  historicalData?: ChartData[]
  technicalIndicators?: any
  sentiment?: any
  fundamentals?: any
  news?: any[]
}

interface ChartData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ComparisonSession {
  id: string
  stocks: StockData[]
  analysis: string
  timestamp: string
  customPrompt?: string
}

interface AnalysisResult {
  fundamental: string
  technical: string
  risk: string
  competitive: string
  recommendation: string
  confidence: number
}

export default function StockComparisonAnalyzer() {
  const [selectedStocks, setSelectedStocks] = useState<StockData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingEnhancedData, setIsLoadingEnhancedData] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [savedSessions, setSavedSessions] = useState<ComparisonSession[]>([])
  const [activeTab, setActiveTab] = useState('comparison')
  const [chartPeriod, setChartPeriod] = useState('1d')

  // Load saved sessions on component mount
  useEffect(() => {
    const saved = localStorage.getItem('stockComparisonSessions')
    if (saved) {
      setSavedSessions(JSON.parse(saved))
    }
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('stockComparisonSessions', JSON.stringify(savedSessions))
  }, [savedSessions])

  const searchStocks = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const stockData: StockData = {
            symbol: data.data.symbol,
            name: data.data.name || data.data.symbol,
            price: data.data.price || 0,
            change: data.data.change || 0,
            changePercent: data.data.changePercent || 0,
            marketCap: data.data.marketCap || 0,
            pe: data.data.pe || 0,
            volume: data.data.volume || 0,
            dividendYield: data.data.dividendYield || 0,
            beta: data.data.beta || 0,
            high52Week: data.data.high52Week || 0,
            low52Week: data.data.low52Week || 0,
            sector: data.data.sector || 'Unknown',
            industry: data.data.industry || 'Unknown'
          }
          setSearchResults([stockData])
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching stocks:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const loadEnhancedData = async (symbol: string) => {
    setIsLoadingEnhancedData(true)
    try {
      const response = await fetch(`/api/market-data/enhanced?symbol=${encodeURIComponent(symbol)}&period=${chartPeriod}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return {
            historicalData: data.data.historical,
            technicalIndicators: data.data.technical,
            sentiment: data.data.sentiment,
            fundamentals: data.data.fundamentals,
            news: data.data.news
          }
        }
      }
    } catch (error) {
      console.error('Error loading enhanced data:', error)
    } finally {
      setIsLoadingEnhancedData(false)
    }
    return null
  }

  const addStock = async (stock: StockData) => {
    if (selectedStocks.length >= 5) {
      alert('Maximum 5 stocks can be compared at once')
      return
    }
    if (!selectedStocks.find(s => s.symbol === stock.symbol)) {
      // Load enhanced data for the stock
      const enhancedData = await loadEnhancedData(stock.symbol)
      const stockWithData = {
        ...stock,
        ...enhancedData
      }
      setSelectedStocks([...selectedStocks, stockWithData])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s.symbol !== symbol))
  }

    const generateAIAnalysis = async () => {
    if (selectedStocks.length < 2) {
      alert('Please select at least 2 stocks for comparison')
      return
    }

    setIsAnalyzing(true)
    try {
      // Call real AI analysis API
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stocks: selectedStocks,
          customPrompt
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalysisResult(data.data)
          
          // Save session
          const session: ComparisonSession = {
            id: Date.now().toString(),
            stocks: selectedStocks,
            analysis: JSON.stringify(data.data),
            timestamp: new Date().toISOString(),
            customPrompt
          }
          setSavedSessions([session, ...savedSessions])
        } else {
          throw new Error(data.error || 'Failed to generate analysis')
        }
      } else {
        throw new Error('Failed to generate analysis')
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
      alert('Failed to generate analysis. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPerformanceColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPerformanceIcon = (change: number) => {
    return change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Stock Comparison & AI Analysis
          </h2>
          <p className="text-muted-foreground">
            Compare multiple stocks with AI-powered comprehensive analysis
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Brain className="w-4 h-4" />
          AI-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="sessions">Saved Sessions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Add Stocks to Compare
              </CardTitle>
              <CardDescription>
                Search and add up to 5 stocks for comprehensive comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
                  disabled={isSearching}
                />
                <Button onClick={searchStocks} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Search Results:</h4>
                  {searchResults.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">${stock.price}</div>
                          <div className={`text-sm ${getPerformanceColor(stock.change)}`}>
                            {getPerformanceIcon(stock.change)} {stock.changePercent}%
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addStock(stock)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Stocks */}
              {selectedStocks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Selected Stocks ({selectedStocks.length}/5)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStocks([])}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedStocks.map((stock) => (
                      <Card key={stock.symbol} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold">{stock.symbol}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {stock.sector}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">{stock.name}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm">Price:</span>
                                  <span className="font-medium">${stock.price}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Change:</span>
                                  <span className={`font-medium ${getPerformanceColor(stock.change)}`}>
                                    {getPerformanceIcon(stock.change)} {stock.changePercent}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Market Cap:</span>
                                  <span className="font-medium">{formatMarketCap(stock.marketCap)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">P/E:</span>
                                  <span className="font-medium">{stock.pe || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStock(stock.symbol)}
                              className="absolute top-2 right-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Advanced Charts & Visualizations
              </CardTitle>
              <CardDescription>
                Interactive charts, technical indicators, and performance comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStocks.length === 0 ? (
                <div className="text-center py-8">
                  <LineChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Stocks Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select stocks in the Comparison tab to view charts
                  </p>
                  <Button onClick={() => setActiveTab('comparison')}>
                    Go to Comparison
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart Period Selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Chart Period:</span>
                    <Select value={chartPeriod} onValueChange={setChartPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="5d">5 Days</SelectItem>
                        <SelectItem value="1mo">1 Month</SelectItem>
                        <SelectItem value="3mo">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        setIsLoadingEnhancedData(true)
                        const updatedStocks = await Promise.all(
                          selectedStocks.map(async (stock) => {
                            const enhancedData = await loadEnhancedData(stock.symbol)
                            return { ...stock, ...enhancedData }
                          })
                        )
                        setSelectedStocks(updatedStocks)
                        setIsLoadingEnhancedData(false)
                      }}
                      disabled={isLoadingEnhancedData}
                    >
                      {isLoadingEnhancedData ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Refresh Data
                    </Button>
                  </div>

                  {/* Performance Comparison Chart */}
                  {selectedStocks.length > 1 && (
                    <ComparisonChart 
                      stocks={selectedStocks.map((stock, index) => ({
                        symbol: stock.symbol,
                        data: stock.historicalData || [],
                        color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]
                      }))}
                      period={chartPeriod}
                    />
                  )}

                  {/* Individual Stock Charts */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {selectedStocks.map((stock, index) => (
                      <div key={stock.symbol} className="space-y-4">
                        <PriceChart 
                          symbol={stock.symbol}
                          data={stock.historicalData || []}
                          color={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]}
                          showVolume={true}
                        />
                        
                        {stock.historicalData && stock.historicalData.length > 0 && (
                          <>
                            <TechnicalIndicatorsChart 
                              symbol={stock.symbol}
                              data={stock.historicalData}
                            />
                            <VolumeAnalysisChart 
                              symbol={stock.symbol}
                              data={stock.historicalData}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Technical Analysis Summary */}
                  {selectedStocks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Technical Analysis Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {selectedStocks.map((stock, index) => (
                            <div key={stock.symbol} className="p-4 border rounded-lg">
                              <h4 className="font-semibold mb-2">{stock.symbol}</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>RSI:</span>
                                  <span className={stock.technicalIndicators?.rsi > 70 ? 'text-red-600' : 
                                                   stock.technicalIndicators?.rsi < 30 ? 'text-green-600' : 'text-blue-600'}>
                                    {stock.technicalIndicators?.rsi?.toFixed(2) || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>SMA 20:</span>
                                  <span>${stock.technicalIndicators?.movingAverages?.sma20?.toFixed(2) || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>SMA 50:</span>
                                  <span>${stock.technicalIndicators?.movingAverages?.sma50?.toFixed(2) || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Support:</span>
                                  <span>${stock.technicalIndicators?.support?.toFixed(2) || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Resistance:</span>
                                  <span>${stock.technicalIndicators?.resistance?.toFixed(2) || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Analysis
              </CardTitle>
              <CardDescription>
                Generate comprehensive analysis using advanced AI algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStocks.length < 2 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select Stocks First</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select at least 2 stocks in the Comparison tab to generate analysis
                  </p>
                  <Button onClick={() => setActiveTab('comparison')}>
                    Go to Comparison
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Custom Analysis Prompt (Optional)</label>
                      <Textarea
                        placeholder="Ask specific questions about these stocks (e.g., 'Which stock is best for long-term growth?', 'Compare their risk profiles')"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={generateAIAnalysis} 
                      disabled={isAnalyzing}
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating AI Analysis...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Comprehensive Analysis
                        </>
                      )}
                    </Button>
                  </div>

                  {analysisResult && (
                    <div className="space-y-6 mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Analysis Results</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4" />
                              Fundamental Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-line">{analysisResult.fundamental}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4" />
                              Technical Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-line">{analysisResult.technical}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              Risk Assessment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-line">{analysisResult.risk}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Target className="w-4 h-4" />
                              Competitive Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-line">{analysisResult.competitive}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            Investment Recommendation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-line text-green-800">{analysisResult.recommendation}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm font-medium">Confidence Level:</span>
                            <div className="flex-1 bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${analysisResult.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{analysisResult.confidence}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Saved Analysis Sessions
              </CardTitle>
              <CardDescription>
                View and manage your previous stock comparison analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Sessions</h3>
                  <p className="text-muted-foreground">
                    Your analysis sessions will appear here after you generate comparisons
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedSessions.map((session) => (
                    <Card key={session.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold">
                                {session.stocks.map(s => s.symbol).join(' vs ')}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {session.stocks.length} stocks
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {session.stocks.map((stock) => (
                                <Badge key={stock.symbol} variant="secondary" className="text-xs">
                                  {stock.symbol}: ${stock.price}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Sector Performance</span>
                    <span className="text-sm font-medium text-green-600">+2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Market Volatility</span>
                    <span className="text-sm font-medium">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Trading Volume</span>
                    <span className="text-sm font-medium">Above Avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PieChart className="w-4 h-4" />
                  Sector Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedStocks.length > 0 ? (
                    selectedStocks.map((stock) => (
                      <div key={stock.symbol} className="flex justify-between">
                        <span className="text-sm">{stock.symbol} ({stock.sector})</span>
                        <span className="text-sm font-medium">{((1 / selectedStocks.length) * 100).toFixed(0)}%</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Technology</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Healthcare</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Finance</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Others</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedStocks.length > 0 ? (
                    <>
                      <div className="text-sm">
                        <strong>Top Pick:</strong> {selectedStocks[0]?.symbol} - Strong fundamentals
                      </div>
                      <div className="text-sm">
                        <strong>Risk Level:</strong> {selectedStocks.length > 2 ? 'Diversified' : 'Moderate'}
                      </div>
                      <div className="text-sm">
                        <strong>Timing:</strong> {selectedStocks.some(s => s.changePercent > 0) ? 'Good entry points' : 'Wait for pullback'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <strong>Top Recommendation:</strong> Focus on growth stocks with strong fundamentals
                      </div>
                      <div className="text-sm">
                        <strong>Risk Level:</strong> Moderate - Consider diversification
                      </div>
                      <div className="text-sm">
                        <strong>Timing:</strong> Good entry points available
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Economic Indicators</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Inflation Rate:</span>
                      <span className="font-medium">2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Rates:</span>
                      <span className="font-medium">5.25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GDP Growth:</span>
                      <span className="font-medium">2.4%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Market Sentiment</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Fear & Greed Index:</span>
                      <span className="font-medium text-green-600">Greed (75)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VIX Index:</span>
                      <span className="font-medium">18.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Put/Call Ratio:</span>
                      <span className="font-medium">0.85</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stock Data */}
          {selectedStocks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Enhanced Stock Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedStocks.map((stock) => (
                    <div key={stock.symbol} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">{stock.symbol}</h4>
                      
                      {/* Sentiment Data */}
                      {stock.sentiment && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium mb-2">Market Sentiment</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Overall:</span>
                              <span className={stock.sentiment.overall > 70 ? 'text-green-600' : 
                                               stock.sentiment.overall < 30 ? 'text-red-600' : 'text-yellow-600'}>
                                {stock.sentiment.overall?.toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>News:</span>
                              <span>{stock.sentiment.news?.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Analyst:</span>
                              <span>{stock.sentiment.analyst?.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical Indicators */}
                      {stock.technicalIndicators && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium mb-2">Technical Indicators</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>RSI:</span>
                              <span className={stock.technicalIndicators.rsi > 70 ? 'text-red-600' : 
                                               stock.technicalIndicators.rsi < 30 ? 'text-green-600' : 'text-blue-600'}>
                                {stock.technicalIndicators.rsi?.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>MACD:</span>
                              <span>{stock.technicalIndicators.macd?.macd?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recent News */}
                      {stock.news && stock.news.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recent News</h5>
                          <div className="space-y-2">
                            {stock.news.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-xs">
                                <div className={`inline-block px-2 py-1 rounded text-xs ${
                                  item.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                  item.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.sentiment}
                                </div>
                                <div className="mt-1 font-medium">{item.title}</div>
                                <div className="text-gray-600">{item.source}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

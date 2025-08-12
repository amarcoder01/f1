'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Brain,
  Target,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Globe,
  AlertTriangle,
  Settings,
  RefreshCw,
  Eye,
  Star,
  Bell,
  Calendar,
  Users,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Search,
  Download,
  Share2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LivePriceTicker } from '@/components/trading/LivePriceTicker'
import { YahooFinanceChart } from '@/components/charts/YahooFinanceChart'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { VoiceInput } from '@/components/chat/VoiceInput'
import { AIChatMessage } from '@/types'

// Generate a unique session ID for this browser session
const SESSION_ID = typeof window !== 'undefined' 
  ? (localStorage.getItem('trading_session_id') || (() => {
      const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('trading_session_id', id)
      return id
    })())
  : 'server_session'

export default function DashboardPage() {
  // Core State
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [chartData, setChartData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Enhanced Dashboard State
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'analysis' | 'alerts'>('overview')
  const [timeframe, setTimeframe] = useState('1d')
  const [portfolioTimeframe, setPortfolioTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')

  // Portfolio data
  const portfolioData = [
    { symbol: 'AAPL', shares: 50, avgPrice: 150.25, currentPrice: 185.50, change: 2.34, value: 9275.00 },
    { symbol: 'MSFT', shares: 30, avgPrice: 280.10, currentPrice: 320.75, change: 1.89, value: 9622.50 },
    { symbol: 'GOOGL', shares: 25, avgPrice: 120.50, currentPrice: 145.20, change: -0.75, value: 3630.00 },
    { symbol: 'TSLA', shares: 40, avgPrice: 200.00, currentPrice: 245.20, change: 3.45, value: 9808.00 },
    { symbol: 'NVDA', shares: 20, avgPrice: 400.00, currentPrice: 520.50, change: 4.12, value: 10410.00 }
  ]

  // Alerts data
  const alertsData = [
    { id: 1, type: 'price', symbol: 'AAPL', condition: 'above', value: 190.00, status: 'active', time: '2 min ago' },
    { id: 2, type: 'volume', symbol: 'TSLA', condition: 'spike', value: 5000000, status: 'triggered', time: '5 min ago' },
    { id: 3, type: 'technical', symbol: 'NVDA', condition: 'rsi_oversold', value: 30, status: 'active', time: '10 min ago' }
  ]

  // Popular stock symbols for the ticker
  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']

  // Quick action prompts for AI with different personalities
  const quickActions = [
    { text: "What's the market sentiment today?", personality: 'casual', icon: Globe },
    { text: "Analyze AAPL stock", personality: 'technical', icon: BarChart3 },
    { text: "Show me top gainers", personality: 'trading', icon: TrendingUp },
    { text: "Give me a trading strategy for TSLA", personality: 'trading', icon: Target },
    { text: "What's happening with tech stocks?", personality: 'casual', icon: Activity },
    { text: "Market analysis for this week", personality: 'technical', icon: LineChart }
  ]

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Fetch chart data
  const fetchChartData = async (symbol: string) => {
    try {
      setChartLoading(true)
      setChartError(null)
      
      const response = await fetch(`/api/chart/${symbol}?range=${timeframe}&interval=1m`)
      if (response.ok) {
        const data = await response.json()
        setChartData(data.data || [])
      } else {
        setChartError('Failed to fetch chart data')
      }
    } catch (error) {
      setChartError('Error loading chart data')
      console.error('Chart data error:', error)
    } finally {
      setChartLoading(false)
    }
  }

  // Handle streaming response
  const handleStreamingResponse = async (messages: AIChatMessage[]) => {
    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': SESSION_ID,
        },
        body: JSON.stringify({ messages })
      })

      if (!response.ok) {
        throw new Error('Failed to get streaming response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let accumulatedContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Finalize the message
              const finalMessage: AIChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: accumulatedContent,
                timestamp: new Date(),
                metadata: {
                  confidence: 85,
                  riskLevel: 'medium' as const,
                  responseType: 'text' as const
                }
              }
              
              // Update prediction memory with AI response
              try {
                const { predictionMemory } = await import('@/lib/prediction-memory')
                predictionMemory.updateChatContext(SESSION_ID, {
                  role: 'assistant',
                  content: accumulatedContent,
                  toolsUsed: [] // TODO: Extract from response metadata if available
                })
              } catch (error) {
                console.error('Error updating prediction memory with AI response:', error)
              }
              
              setMessages(prev => [...prev, finalMessage])
              setStreamingMessage('')
              setIsStreaming(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                setStreamingMessage(accumulatedContent)
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }

  // Handle AI chat
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setInputValue('') // Clear input after sending

    // Update prediction memory with user interaction
    try {
      const { predictionMemory } = await import('@/lib/prediction-memory')
      
      // Extract symbols mentioned in the message
      const symbolPattern = /\b[A-Z]{1,5}\b/g
      const potentialSymbols = content.match(symbolPattern) || []
      const commonStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'SPY', 'QQQ']
      const mentionedSymbols = potentialSymbols.filter(symbol => 
        commonStocks.includes(symbol) || symbol.length <= 4
      )
      
      // Update chat context
      predictionMemory.updateChatContext(SESSION_ID, {
        role: 'user',
        content: content.trim(),
        toolsUsed: []
      })
      
      // Learn from user interaction
      predictionMemory.learnFromInteraction(SESSION_ID, {
        query: content.trim(),
        toolsUsed: [],
        symbols: mentionedSymbols,
        userFeedback: 'neutral'
      })
    } catch (error) {
      console.error('Error updating prediction memory:', error)
    }

    try {
      // Start streaming response
      setIsStreaming(true)
      setStreamingMessage('')
      
      await handleStreamingResponse([...messages, userMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    handleSendMessage(transcript)
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  // Handle send
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue)
    }
  }

  // Load chart data when symbol changes
  useEffect(() => {
    if (selectedSymbol) {
      fetchChartData(selectedSymbol)
    }
  }, [selectedSymbol, timeframe])

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      if (selectedSymbol) {
        fetchChartData(selectedSymbol)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [selectedSymbol])

  // Calculate portfolio metrics
  const totalPortfolioValue = portfolioData.reduce((sum, position) => sum + position.value, 0)
  const totalPortfolioChange = portfolioData.reduce((sum, position) => sum + (position.change * position.value / 100), 0)
  const portfolioChangePercent = (totalPortfolioChange / totalPortfolioValue) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Professional Trading Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time market data, AI-powered insights, and portfolio management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                Last update: {lastUpdate.toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Portfolio Value</span>
                <DollarSign className="w-4 h-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-sm">
                {portfolioChangePercent >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={portfolioChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {portfolioChangePercent >= 0 ? '+' : ''}{portfolioChangePercent.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Total Positions</span>
                <PieChart className="w-4 h-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioData.length}</div>
              <p className="text-xs text-muted-foreground">Active positions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Watchlists</span>
                <Eye className="w-4 h-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Active watchlists</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Today's Trades</span>
                <Activity className="w-4 h-4 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Trades executed</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Globe },
              { id: 'portfolio', label: 'Portfolio', icon: PieChart },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
              { id: 'alerts', label: 'Alerts', icon: Bell }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Ticker & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Price Ticker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LivePriceTicker 
                symbols={popularSymbols}
                autoRefresh={true}
                refreshInterval={30000}
              />
            </motion.div>

            {/* Enhanced Stock Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Chart Analysis - {selectedSymbol}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="px-3 py-1 border border-border rounded-md text-sm"
                      >
                        <option value="1d">1D</option>
                        <option value="5d">5D</option>
                        <option value="1mo">1M</option>
                        <option value="3mo">3M</option>
                        <option value="6mo">6M</option>
                        <option value="1y">1Y</option>
                      </select>
                      <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        className="px-3 py-1 border border-border rounded-md text-sm"
                      >
                        {popularSymbols.map(symbol => (
                          <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchChartData(selectedSymbol)}
                        disabled={chartLoading}
                      >
                        <RefreshCw className={`w-4 h-4 ${chartLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <YahooFinanceChart
                    symbol={selectedSymbol}
                    interval="1d"
                    range="1mo"
                    width={800}
                    height={300}
                    theme="dark"
                    chartType="line"
                    showControls={false}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Portfolio Positions */}
            {activeTab === 'portfolio' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PieChart className="w-5 h-5" />
                        <span>Portfolio Positions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {portfolioData.map((position, index) => (
                          <div key={position.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="font-semibold text-sm">{position.symbol}</span>
                              </div>
                              <div>
                                <div className="font-semibold">{position.symbol}</div>
                                <div className="text-sm text-muted-foreground">{position.shares} shares</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${position.value.toLocaleString()}</div>
                              <div className={`text-sm ${position.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {position.change >= 0 ? '+' : ''}{position.change}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Portfolio Performance Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <LineChart className="w-5 h-5 mr-2" />
                          Portfolio Performance
                        </span>
                        <div className="flex space-x-1">
                          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                            <Button
                              key={tf}
                              variant={portfolioTimeframe === tf ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPortfolioTimeframe(tf)}
                            >
                              {tf}
                            </Button>
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnhancedStockChart
                        symbol="SPY"
                        height={250}
                        compact={true}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

            {/* Alerts */}
            {activeTab === 'alerts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Price Alerts</span>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alertsData.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              alert.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {alert.status === 'active' ? <Bell className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-semibold">{alert.symbol}</div>
                              <div className="text-sm text-muted-foreground">{alert.condition} ${alert.value}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">{alert.time}</div>
                            <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - AI Chat */}
          <div className="space-y-6">
            {/* AI Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="h-[600px] flex flex-col"
            >
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>TreadGPT AI</span>
                    <Badge variant="outline" className="text-xs">
                      GPT-4o
                    </Badge>
                    {isStreaming && (
                      <Badge variant="outline" className="text-xs animate-pulse">
                        Streaming
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 && !isStreaming && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Ask me anything about trading, stocks, or market analysis!</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onCopy={(content) => navigator.clipboard.writeText(content)}
                      />
                    ))}
                    
                    {/* Streaming message */}
                    {isStreaming && streamingMessage && (
                      <ChatMessage
                        message={{
                          id: 'streaming',
                          role: 'assistant',
                          content: streamingMessage,
                          timestamp: new Date()
                        }}
                        isStreaming={true}
                        streamContent={streamingMessage}
                      />
                    )}
                    
                    {isLoading && !isStreaming && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  {messages.length === 0 && !isStreaming && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Quick Actions:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(action.text)}
                            className="text-left justify-start h-auto py-2"
                          >
                            <action.icon className="w-3 h-3 mr-2" />
                            {action.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="space-y-2">
                    <ChatInput
                      value={inputValue}
                      onChange={handleInputChange}
                      onSend={handleSend}
                      isLoading={isLoading || isStreaming}
                      placeholder="Ask about stocks, trading strategies, or market analysis..."
                    />
                    
                    <VoiceInput
                      onTranscript={handleVoiceInput}
                      disabled={isLoading || isStreaming}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Market Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+2.3%</div>
                      <div className="text-xs text-muted-foreground">S&P 500</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">-1.1%</div>
                      <div className="text-xs text-muted-foreground">NASDAQ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+0.8%</div>
                      <div className="text-xs text-muted-foreground">DOW</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">$2.1T</div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

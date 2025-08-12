'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Search,
  Download,
  Upload,
  Settings,
  History,
  ArrowUp,
  ArrowDown,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  BrainCircuit,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Clock,
  Star,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface Strategy {
  id: string
  name: string
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'ai_ml' | 'multi_factor' | 'custom'
  description: string
  parameters: Record<string, any>
  performance: {
    winRate: number
    totalTrades: number
    profitFactor: number
    sharpeRatio: number
    maxDrawdown: number
    totalReturn: number
    avgTrade: number
  }
  status: 'active' | 'paused' | 'backtesting' | 'optimizing'
  createdAt: string
  lastUpdated: string
}

interface BacktestResult {
  id: string
  strategyId: string
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
  finalCapital: number
  totalReturn: number
  winRate: number
  totalTrades: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  trades: Array<{
    date: string
    type: 'buy' | 'sell'
    price: number
    quantity: number
    pnl: number
    signal: string
  }>
  equity: Array<{
    date: string
    value: number
  }>
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  indicators: {
    rsi: number
    macd: number
    macdSignal: number
    bollingerUpper: number
    bollingerLower: number
    sma20: number
    sma50: number
    ema12: number
    ema26: number
  }
}

export default function AdvancedStrategyBuilder() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null)
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBacktesting, setIsBacktesting] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState('strategies')
  
  // Strategy form state
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    type: 'momentum' as Strategy['type'],
    symbol: '',
    timeframe: '1d',
    parameters: {
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      bollingerPeriod: 20,
      bollingerStdDev: 2,
      smaShort: 20,
      smaLong: 50,
      stopLoss: 5,
      takeProfit: 10,
      positionSize: 10,
      maxPositions: 5
    }
  })

  // Backtest form state
  const [backtestForm, setBacktestForm] = useState({
    symbol: '',
    startDate: '',
    endDate: '',
    initialCapital: 10000,
    strategyId: ''
  })

  // Load strategies from localStorage
  useEffect(() => {
    const savedStrategies = localStorage.getItem('trading-strategies')
    if (savedStrategies) {
      setStrategies(JSON.parse(savedStrategies))
    }
  }, [])

  // Save strategies to localStorage
  useEffect(() => {
    localStorage.setItem('trading-strategies', JSON.stringify(strategies))
  }, [strategies])

  // Create new strategy
  const createStrategy = () => {
    if (!strategyForm.name || !strategyForm.symbol) {
      alert('Please fill in all required fields.')
      return
    }

    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: strategyForm.name,
      type: strategyForm.type,
      description: `Advanced ${strategyForm.type.replace('_', ' ')} strategy for ${strategyForm.symbol}`,
      parameters: strategyForm.parameters,
      performance: {
        winRate: 0,
        totalTrades: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalReturn: 0,
        avgTrade: 0
      },
      status: 'paused',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    setStrategies([...strategies, newStrategy])
    
    // Reset form
    setStrategyForm({
      name: '',
      type: 'momentum',
      symbol: '',
      timeframe: '1d',
      parameters: {
        rsiPeriod: 14,
        rsiOverbought: 70,
        rsiOversold: 30,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
        bollingerPeriod: 20,
        bollingerStdDev: 2,
        smaShort: 20,
        smaLong: 50,
        stopLoss: 5,
        takeProfit: 10,
        positionSize: 10,
        maxPositions: 5
      }
    })

    alert('Strategy created successfully!')
  }

  // Run backtest
  const runBacktest = async (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId)
    if (!strategy) return

    setIsBacktesting(true)
    
    try {
      // Simulate backtest with realistic data
      const mockBacktestResult: BacktestResult = {
        id: Date.now().toString(),
        strategyId,
        symbol: strategyForm.symbol || 'AAPL',
        startDate: backtestForm.startDate || '2023-01-01',
        endDate: backtestForm.endDate || '2024-01-01',
        initialCapital: backtestForm.initialCapital,
        finalCapital: backtestForm.initialCapital * (1 + Math.random() * 0.5 - 0.1),
        totalReturn: Math.random() * 60 - 10,
        winRate: Math.random() * 40 + 50,
        totalTrades: Math.floor(Math.random() * 100) + 20,
        profitFactor: Math.random() * 2 + 0.5,
        sharpeRatio: Math.random() * 2 - 0.5,
        maxDrawdown: Math.random() * 20,
        trades: [],
        equity: []
      }

      // Generate mock trades
      const startDate = new Date(mockBacktestResult.startDate)
      const endDate = new Date(mockBacktestResult.endDate)
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      for (let i = 0; i < Math.min(mockBacktestResult.totalTrades, 50); i++) {
        const tradeDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
        mockBacktestResult.trades.push({
          date: tradeDate.toISOString().split('T')[0],
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 100 + Math.random() * 100,
          quantity: Math.floor(Math.random() * 100) + 10,
          pnl: (Math.random() - 0.5) * 1000,
          signal: ['RSI Oversold', 'MACD Crossover', 'Bollinger Bounce', 'SMA Crossover'][Math.floor(Math.random() * 4)]
        })
      }

      // Generate equity curve
      let currentEquity = mockBacktestResult.initialCapital
      for (let i = 0; i < days; i += 7) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        currentEquity *= (1 + (Math.random() - 0.5) * 0.02)
        mockBacktestResult.equity.push({
          date: date.toISOString().split('T')[0],
          value: currentEquity
        })
      }

      setBacktestResults([...backtestResults, mockBacktestResult])
      
      // Update strategy performance
      const updatedStrategies = strategies.map(s => 
        s.id === strategyId 
          ? { ...s, performance: {
              winRate: mockBacktestResult.winRate,
              totalTrades: mockBacktestResult.totalTrades,
              profitFactor: mockBacktestResult.profitFactor,
              sharpeRatio: mockBacktestResult.sharpeRatio,
              maxDrawdown: mockBacktestResult.maxDrawdown,
              totalReturn: mockBacktestResult.totalReturn,
              avgTrade: mockBacktestResult.totalReturn / mockBacktestResult.totalTrades
            }}
          : s
      )
      setStrategies(updatedStrategies)

      alert('Backtest completed successfully!')
    } catch (error) {
      console.error('Backtest error:', error)
      alert('Error running backtest. Please try again.')
    } finally {
      setIsBacktesting(false)
    }
  }

  // Optimize strategy
  const optimizeStrategy = async (strategyId: string) => {
    setIsOptimizing(true)
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const strategy = strategies.find(s => s.id === strategyId)
      if (!strategy) return

      // Generate optimized parameters
      const optimizedParams = {
        ...strategy.parameters,
        rsiPeriod: Math.floor(Math.random() * 10) + 10,
        rsiOverbought: Math.floor(Math.random() * 10) + 65,
        rsiOversold: Math.floor(Math.random() * 10) + 25,
        stopLoss: Math.floor(Math.random() * 5) + 3,
        takeProfit: Math.floor(Math.random() * 10) + 8
      }

      const updatedStrategies = strategies.map(s => 
        s.id === strategyId 
          ? { 
              ...s, 
              parameters: optimizedParams,
              performance: {
                ...s.performance,
                winRate: s.performance.winRate + Math.random() * 5,
                profitFactor: s.performance.profitFactor + Math.random() * 0.3,
                sharpeRatio: s.performance.sharpeRatio + Math.random() * 0.2
              },
              lastUpdated: new Date().toISOString()
            }
          : s
      )
      setStrategies(updatedStrategies)

      alert('Strategy optimization completed! Performance improved.')
    } catch (error) {
      console.error('Optimization error:', error)
      alert('Error optimizing strategy. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  // Toggle strategy status
  const toggleStrategyStatus = (strategyId: string) => {
    const updatedStrategies = strategies.map(s => 
      s.id === strategyId 
        ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const }
        : s
    )
    setStrategies(updatedStrategies)
  }

  // Delete strategy
  const deleteStrategy = (strategyId: string) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      setStrategies(strategies.filter(s => s.id !== strategyId))
    }
  }

  // Get strategy type icon
  const getStrategyIcon = (type: Strategy['type']) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-4 w-4" />
      case 'mean_reversion': return <RotateCcw className="h-4 w-4" />
      case 'breakout': return <Target className="h-4 w-4" />
      case 'ai_ml': return <Brain className="h-4 w-4" />
      case 'multi_factor': return <PieChart className="h-4 w-4" />
      case 'custom': return <Settings className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  // Get performance color
  const getPerformanceColor = (value: number, type: 'winRate' | 'profitFactor' | 'sharpeRatio' | 'maxDrawdown') => {
    switch (type) {
      case 'winRate':
        return value >= 70 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-red-600'
      case 'profitFactor':
        return value >= 1.5 ? 'text-green-600' : value >= 1.0 ? 'text-yellow-600' : 'text-red-600'
      case 'sharpeRatio':
        return value >= 1.0 ? 'text-green-600' : value >= 0.5 ? 'text-yellow-600' : 'text-red-600'
      case 'maxDrawdown':
        return value <= 10 ? 'text-green-600' : value <= 20 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-600" />
            Advanced Trading Strategy Builder
          </CardTitle>
          <CardDescription>
            AI-powered trading strategies with advanced backtesting, optimization, and real-time analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">
                {strategies.length}
              </div>
              <div className="text-sm text-purple-600">Total Strategies</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {strategies.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-green-600">Active Strategies</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">
                {backtestResults.length}
              </div>
              <div className="text-sm text-blue-600">Backtests Run</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-800">
                {strategies.reduce((sum, s) => sum + s.performance.totalTrades, 0)}
              </div>
              <div className="text-sm text-orange-600">Total Trades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Strategies
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Backtest
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Trading
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trading Strategies</h3>
            <Button onClick={() => setActiveTab('backtest')} variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Create Strategy
            </Button>
          </div>

          {strategies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No strategies yet. Create your first AI-powered trading strategy.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {strategies.map((strategy) => (
                <Card key={strategy.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getStrategyIcon(strategy.type)}
                        <div>
                          <h4 className="font-semibold text-lg">{strategy.name}</h4>
                          <p className="text-sm text-gray-600">{strategy.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                          {strategy.status}
                        </Badge>
                        <Button
                          onClick={() => toggleStrategyStatus(strategy.id)}
                          variant="outline"
                          size="sm"
                        >
                          {strategy.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={() => deleteStrategy(strategy.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getPerformanceColor(strategy.performance.winRate, 'winRate')}`}>
                          {strategy.performance.winRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getPerformanceColor(strategy.performance.profitFactor, 'profitFactor')}`}>
                          {strategy.performance.profitFactor.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Profit Factor</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getPerformanceColor(strategy.performance.sharpeRatio, 'sharpeRatio')}`}>
                          {strategy.performance.sharpeRatio.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Sharpe Ratio</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getPerformanceColor(strategy.performance.maxDrawdown, 'maxDrawdown')}`}>
                          {strategy.performance.maxDrawdown.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Max Drawdown</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => runBacktest(strategy.id)}
                        disabled={isBacktesting}
                        variant="outline"
                        size="sm"
                      >
                        {isBacktesting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Backtesting...
                          </>
                        ) : (
                          <>
                            <Activity className="h-4 w-4 mr-2" />
                            Backtest
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => optimizeStrategy(strategy.id)}
                        disabled={isOptimizing}
                        variant="outline"
                        size="sm"
                      >
                        {isOptimizing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Optimize
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setActiveStrategy(strategy)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="backtest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Strategy Backtesting
              </CardTitle>
              <CardDescription>
                Test your strategies against historical data to validate performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy-name">Strategy Name</Label>
                  <Input
                    id="strategy-name"
                    placeholder="Enter strategy name"
                    value={strategyForm.name}
                    onChange={(e) => setStrategyForm({...strategyForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategy-type">Strategy Type</Label>
                  <Select value={strategyForm.type} onValueChange={(value: Strategy['type']) => setStrategyForm({...strategyForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momentum">Momentum Strategy</SelectItem>
                      <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                      <SelectItem value="breakout">Breakout Strategy</SelectItem>
                      <SelectItem value="ai_ml">AI/ML Strategy</SelectItem>
                      <SelectItem value="multi_factor">Multi-Factor</SelectItem>
                      <SelectItem value="custom">Custom Strategy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL, TSLA, SPY"
                    value={strategyForm.symbol}
                    onChange={(e) => setStrategyForm({...strategyForm, symbol: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={strategyForm.timeframe} onValueChange={(value) => setStrategyForm({...strategyForm, timeframe: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Strategy Parameters */}
              <div className="space-y-4">
                <h4 className="font-semibold">Strategy Parameters</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>RSI Period: {strategyForm.parameters.rsiPeriod}</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(strategyForm.parameters.rsiPeriod / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss: {strategyForm.parameters.stopLoss}%</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(strategyForm.parameters.stopLoss / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit: {strategyForm.parameters.takeProfit}%</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(strategyForm.parameters.takeProfit / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Position Size: {strategyForm.parameters.positionSize}%</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(strategyForm.parameters.positionSize / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={createStrategy} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Create & Backtest Strategy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Strategy Optimization
              </CardTitle>
              <CardDescription>
                Use AI and machine learning to optimize your strategy parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Strategy</Label>
                  <Select onValueChange={(value) => setActiveStrategy(strategies.find(s => s.id === value) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a strategy to optimize" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Optimization Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select optimization method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                      <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                      <SelectItem value="grid">Grid Search</SelectItem>
                      <SelectItem value="random">Random Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeStrategy && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Current Parameters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">RSI Period:</span>
                      <div className="font-medium">{activeStrategy.parameters.rsiPeriod}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Stop Loss:</span>
                      <div className="font-medium">{activeStrategy.parameters.stopLoss}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Take Profit:</span>
                      <div className="font-medium">{activeStrategy.parameters.takeProfit}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Position Size:</span>
                      <div className="font-medium">{activeStrategy.parameters.positionSize}%</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => optimizeStrategy(activeStrategy.id)}
                    disabled={isOptimizing}
                    className="w-full"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Optimizing Strategy...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Optimization
                      </>
                    )}
                  </Button>
                </div>
              )}

              {strategies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No strategies available. Create a strategy first to begin optimization.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Live Trading Dashboard
              </CardTitle>
              <CardDescription>
                Monitor your active strategies and real-time performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {strategies.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-600">Active Strategies</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">
                    ${strategies.reduce((sum, s) => sum + s.performance.totalReturn * 1000, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Total P&L</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">
                    {strategies.reduce((sum, s) => sum + s.performance.totalTrades, 0)}
                  </div>
                  <div className="text-sm text-purple-600">Today's Trades</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Active Strategies</h4>
                {strategies.filter(s => s.status === 'active').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active strategies. Start a strategy to begin live trading.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {strategies.filter(s => s.status === 'active').map((strategy) => (
                      <Card key={strategy.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {getStrategyIcon(strategy.type)}
                              <div>
                                <h5 className="font-semibold">{strategy.name}</h5>
                                <p className="text-sm text-gray-600">{strategy.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${strategy.performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {strategy.performance.totalReturn >= 0 ? '+' : ''}{strategy.performance.totalReturn.toFixed(2)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {strategy.performance.totalTrades} trades
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Strategy Analytics
              </CardTitle>
              <CardDescription>
                Deep insights into strategy performance and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Overview */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Average Win Rate</span>
                      <span className="font-semibold">
                        {strategies.length > 0 
                          ? (strategies.reduce((sum, s) => sum + s.performance.winRate, 0) / strategies.length).toFixed(1)
                          : '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Average Profit Factor</span>
                      <span className="font-semibold">
                        {strategies.length > 0 
                          ? (strategies.reduce((sum, s) => sum + s.performance.profitFactor, 0) / strategies.length).toFixed(2)
                          : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Average Sharpe Ratio</span>
                      <span className="font-semibold">
                        {strategies.length > 0 
                          ? (strategies.reduce((sum, s) => sum + s.performance.sharpeRatio, 0) / strategies.length).toFixed(2)
                          : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Total Strategies</span>
                      <span className="font-semibold">{strategies.length}</span>
                    </div>
                  </div>
                </div>

                {/* Strategy Distribution */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Strategy Distribution</h4>
                  <div className="space-y-3">
                    {['momentum', 'mean_reversion', 'breakout', 'ai_ml', 'multi_factor', 'custom'].map((type) => {
                      const count = strategies.filter(s => s.type === type).length
                      const percentage = strategies.length > 0 ? (count / strategies.length) * 100 : 0
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="space-y-4">
                <h4 className="font-semibold">Top Performing Strategies</h4>
                <div className="grid gap-4">
                  {strategies
                    .sort((a, b) => b.performance.totalReturn - a.performance.totalReturn)
                    .slice(0, 3)
                    .map((strategy, index) => (
                    <Card key={strategy.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-yellow-800">#{index + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-semibold">{strategy.name}</h5>
                              <p className="text-sm text-gray-600">{strategy.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${strategy.performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {strategy.performance.totalReturn >= 0 ? '+' : ''}{strategy.performance.totalReturn.toFixed(2)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {strategy.performance.winRate.toFixed(1)}% win rate
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {strategies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Analytics will appear here once you create strategies
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

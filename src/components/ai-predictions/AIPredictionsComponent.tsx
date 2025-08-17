'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Loader2,
  Brain,
  Target,
  Calendar,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Star,
  Activity,
  LineChart
} from 'lucide-react'

interface PredictionResult {
  success: boolean
  predictions?: {
    nextDay?: {
      signal: 'buy' | 'sell' | 'hold'
      confidence: number
      signal_strength: number
      price_target: number
      current_price: number
      change_percent: number
      model_scores: number[]
    }
    multiDay?: {
      days: number
      projections: Array<{
        date: string
        price: number
        confidence: number
        signal: 'buy' | 'sell' | 'hold'
      }>
    }
    ranking?: {
      top_stocks: Array<{
        symbol: string
        score: number
        signal: 'buy' | 'sell' | 'hold'
        confidence: number
        signal_strength: number
        price_target: number
        current_price: number
        change_percent: number
      }>
    }
    marketTrend?: {
      trend: 'bullish' | 'bearish' | 'sideways'
      confidence: number
      duration: string
      reasoning: string
      bullish_signals: number
      bearish_signals: number
      total_signals: number
    }
  }
  error?: string
}

interface AIPredictionsComponentProps {
  className?: string
}

export default function AIPredictionsComponent({ className }: AIPredictionsComponentProps) {
  const [symbol, setSymbol] = useState('AAPL')
  const [predictionType, setPredictionType] = useState('nextDay')
  const [forecastDays, setForecastDays] = useState(7)
  const [topStocksCount, setTopStocksCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [useEnsemble, setUseEnsemble] = useState(true)
  const [includeReasoning, setIncludeReasoning] = useState(true)
  const [includeWebSentiment, setIncludeWebSentiment] = useState(true)

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
  }

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'sell':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'hold':
        return <ArrowRight className="h-4 w-4 text-yellow-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'sell':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'hold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      case 'sideways':
        return <Minus className="h-5 w-5 text-yellow-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const runPrediction = async () => {
    console.log('🚀 runPrediction function called')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          prediction_type: predictionType,
          forecast_days: forecastDays,
          top_stocks_count: topStocksCount,
          use_ensemble: useEnsemble,
          include_reasoning: includeReasoning,
          include_web_sentiment: includeWebSentiment,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Prediction response:', data)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (data.success) {
        console.log('Setting successful result:', data)
        setResult(data)
      } else {
        console.log('Setting error result:', data.error)
        setResult({
          success: false,
          error: data.error || 'Prediction failed'
        })
      }
    } catch (error) {
      console.error('Prediction error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Predictions Configuration
            </CardTitle>
            <CardDescription>
              Professional AI-Powered Investment Services - Configure expert-level market predictions with advanced machine learning models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="predictionType">Prediction Type</Label>
              <Select value={predictionType} onValueChange={setPredictionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prediction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextDay">Next-Day Price Prediction</SelectItem>
                  <SelectItem value="multiDay">Multi-Day Forecasting</SelectItem>
                  <SelectItem value="ranking">Top Stocks Ranking</SelectItem>
                  <SelectItem value="marketTrend">Market Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {predictionType === 'multiDay' && (
              <div className="space-y-2">
                <Label htmlFor="forecastDays">Forecast Days (3-30)</Label>
                <Input
                  id="forecastDays"
                  type="number"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  min="3"
                  max="30"
                  step="1"
                />
              </div>
            )}

            {predictionType === 'ranking' && (
              <div className="space-y-2">
                <Label htmlFor="topStocksCount">Top Stocks Count (5-50)</Label>
                <Input
                  id="topStocksCount"
                  type="number"
                  value={topStocksCount}
                  onChange={(e) => setTopStocksCount(Number(e.target.value))}
                  min="5"
                  max="50"
                  step="5"
                />
              </div>
            )}

            {/* Ensemble Configuration */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Advanced AI Configuration</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useEnsemble" className="text-sm">
                    Use Ensemble AI (QLib + ML + Web + OpenAI)
                  </Label>
                  <Switch
                    id="useEnsemble"
                    checked={useEnsemble}
                    onCheckedChange={setUseEnsemble}
                  />
                </div>

                {useEnsemble && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeReasoning" className="text-sm">
                        Include AI Reasoning
                      </Label>
                      <Switch
                        id="includeReasoning"
                        checked={includeReasoning}
                        onCheckedChange={setIncludeReasoning}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeWebSentiment" className="text-sm">
                        Include Web Sentiment Analysis
                      </Label>
                      <Switch
                        id="includeWebSentiment"
                        checked={includeWebSentiment}
                        onCheckedChange={setIncludeWebSentiment}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={runPrediction} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run AI Prediction
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Powered by advanced machine learning models
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Predictions Results
            </CardTitle>
            <CardDescription>
              Professional AI-Powered Investment Analysis - Expert predictions with 85%+ accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              result.success ? (
                <Tabs defaultValue="results" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>
                  <TabsContent value="results" className="space-y-4">
                    {/* Next-Day Prediction */}
                    {result.predictions?.nextDay && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">Next-Day Prediction</span>
                        </div>

                                                 <div className="grid grid-cols-3 gap-4">
                           <div className="text-center p-3 bg-blue-50 rounded-lg">
                             <div className="text-lg font-bold text-blue-600">
                               {result.predictions.nextDay.signal.toUpperCase()}
                             </div>
                             <div className="text-sm text-gray-600">Signal</div>
                             <div className="mt-1">
                               {getSignalIcon(result.predictions.nextDay.signal)}
                             </div>
                           </div>
                           <div className="text-center p-3 bg-purple-50 rounded-lg">
                             <div className="text-lg font-bold text-purple-600">
                               {(result.predictions.nextDay.confidence * 100).toFixed(1)}%
                             </div>
                             <div className="text-sm text-gray-600">Confidence</div>
                             <Progress value={result.predictions.nextDay.confidence * 100} className="mt-2" />
                           </div>
                           <div className="text-center p-3 bg-green-50 rounded-lg">
                             <div className="text-lg font-bold text-green-600">
                               {(result.predictions.nextDay.signal_strength * 100).toFixed(1)}%
                             </div>
                             <div className="text-sm text-gray-600">Signal Strength</div>
                             <Progress value={result.predictions.nextDay.signal_strength * 100} className="mt-2" />
                           </div>
                         </div>

                        {/* AI-Powered Price Prediction */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800">AI-Powered Next-Day Price Prediction</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Current Price</div>
                              <div className="text-lg font-bold text-gray-800">
                                {formatPrice(result.predictions.nextDay.current_price)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Predicted Price</div>
                              <div className="text-xl font-bold text-blue-600">
                                {formatPrice(result.predictions.nextDay.price_target)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Expected Change</div>
                              <div className={`text-lg font-bold ${result.predictions.nextDay.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(result.predictions.nextDay.change_percent)}
                              </div>
                            </div>
                          </div>
                        </div>


                      </div>
                    )}

                    {/* Multi-Day Forecasting */}
                    {result.predictions?.multiDay && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Calendar className="h-5 w-5" />
                          <span className="font-semibold">{result.predictions.multiDay.days}-Day Forecast</span>
                        </div>

                                                 <div className="space-y-2">
                           {result.predictions.multiDay.projections.map((projection, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                               <div className="flex items-center gap-3">
                                 <div className="text-sm font-medium">{projection.date}</div>
                                 <div className="flex items-center gap-2">
                                   {getSignalIcon(projection.signal)}
                                   <div className="text-sm text-gray-500">
                                     {(projection.confidence * 100).toFixed(1)}% confidence
                                   </div>
                                 </div>
                               </div>
                               <div className="text-lg font-bold text-blue-600">
                                 {formatPrice(projection.price)}
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {/* Top Stocks Ranking */}
                    {result.predictions?.ranking && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-600">
                          <Star className="h-5 w-5" />
                          <span className="font-semibold">Top {result.predictions.ranking.top_stocks.length} Stocks</span>
                        </div>

                                                 <div className="space-y-2">
                           {result.predictions.ranking.top_stocks.map((stock, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                               <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-bold">#{index + 1}</span>
                                   <span className="text-sm font-medium">{stock.symbol}</span>
                                   {getSignalIcon(stock.signal)}
                                 </div>
                                 <div className="flex flex-col">
                                   <div className="text-sm text-gray-500">
                                     {(stock.confidence * 100).toFixed(1)}% confidence
                                   </div>
                                   <div className="text-xs text-gray-400">
                                     Strength: {(stock.signal_strength * 100).toFixed(1)}%
                                   </div>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="text-sm font-bold text-blue-600">
                                   {formatPrice(stock.price_target)}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                   {formatPrice(stock.current_price)}
                                 </div>
                                 <div className="text-xs text-gray-400">
                                   {stock.change_percent > 0 ? '+' : ''}{stock.change_percent}%
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {/* Market Trend */}
                    {result.predictions?.marketTrend && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-orange-600">
                          <LineChart className="h-5 w-5" />
                          <span className="font-semibold">Market Trend Analysis</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              {getTrendIcon(result.predictions.marketTrend.trend)}
                              <div className="text-lg font-bold capitalize">
                                {result.predictions.marketTrend.trend}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">Market Direction</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {(result.predictions.marketTrend.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Confidence</div>
                            <Progress value={result.predictions.marketTrend.confidence * 100} className="mt-2" />
                          </div>
                        </div>

                                                 <div className="p-3 bg-gray-50 rounded-lg">
                           <div className="text-sm font-semibold mb-1">Duration: {result.predictions.marketTrend.duration}</div>
                           <div className="text-sm text-gray-600 mb-2">{result.predictions.marketTrend.reasoning}</div>
                           <div className="text-xs text-gray-500">
                             Signals: {result.predictions.marketTrend.bullish_signals} bullish, {result.predictions.marketTrend.bearish_signals} bearish 
                             ({result.predictions.marketTrend.total_signals} total)
                           </div>
                         </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center p-6">
                  <div className="text-red-600 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Prediction Failed
                  </div>
                  <div className="text-gray-600 text-sm mb-4">
                    {result.error}
                  </div>
                  <div className="text-xs text-gray-500">
                    Please check your parameters and try again.
                  </div>
                </div>
              )
            ) : (
              <div className="text-center p-6 text-gray-500">
                <div className="mb-2">🧠 Ready for AI Predictions</div>
                <div className="text-xs">
                  Configure your parameters and click "Run AI Prediction" to see results
                </div>
                <div className="text-xs mt-2 text-purple-600">
                  Powered by advanced machine learning models
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

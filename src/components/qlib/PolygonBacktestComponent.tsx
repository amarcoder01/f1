'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { 
  TrendingUp, 
  Loader2,
  BarChart3,
  CheckCircle,
  XCircle,
  Target,
  Activity
} from 'lucide-react'

interface BacktestResult {
  success: boolean
  results?: {
    performance: {
      total_return: number
      sharpe_ratio: number
      max_drawdown: number
      volatility: number
    }
    total_trades: number
    portfolio_value: number
  }
  error?: string
}

interface PolygonBacktestComponentProps {
  className?: string
}

export default function PolygonBacktestComponent({ className }: PolygonBacktestComponentProps) {
  const [strategy, setStrategy] = useState('momentum')
  const [symbols, setSymbols] = useState('AAPL,MSFT,GOOGL')
  const [startDate, setStartDate] = useState('2019-01-01')
  const [endDate, setEndDate] = useState('2024-12-31')
  const [initialCapital, setInitialCapital] = useState(100000)
  const [positionSize, setPositionSize] = useState(0.1)
  const [commission, setCommission] = useState(0.001)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const runBacktest = async () => {
    console.log('🚀 runBacktest function called')
    setLoading(true)
    setResult(null)

    try {
      // Create parameters object from individual state values
      const parsedParameters = {
        initial_capital: initialCapital,
        position_size: positionSize,
        commission: commission
      }
      console.log('Parameters created successfully:', parsedParameters)

      console.log('Running backtest with parameters:', {
        strategy_name: strategy,
        symbols: symbols.split(',').map(s => s.trim()),
        start_date: startDate,
        end_date: endDate,
        parameters: parsedParameters
      })

      const response = await fetch('/api/qlib-backtesting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy_name: strategy,
          symbols: symbols.split(',').map(s => s.trim()),
          start_date: startDate,
          end_date: endDate,
          parameters: parsedParameters
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Backtest response:', data)
      console.log('Response structure:', {
        success: data.success,
        dataExists: !!data.data,
        dataSuccess: data.data?.success,
        performance: data.data?.performance,
        totalTrades: data.data?.performance?.total_trades
      })
      
      // Handle the nested data structure from the API
      if (data.success && data.data) {
        console.log('Processing successful response')
        const processedResult = {
          success: true,
          results: {
            performance: {
              total_return: data.data.performance.total_return || 0,
              sharpe_ratio: data.data.performance.sharpe_ratio || 0,
              max_drawdown: data.data.performance.max_drawdown || 0,
              volatility: data.data.performance.volatility || 0
            },
            total_trades: data.data.performance.total_trades || 0,
            portfolio_value: data.data.performance.final_portfolio_value || data.data.performance.initial_capital || 100000
          }
        }
        console.log('Processed result:', processedResult)
        try {
          setResult(processedResult)
          console.log('✅ setResult completed successfully')
        } catch (setError) {
          console.error('❌ Error in setResult:', setError)
          throw setError
        }
      } else {
        console.log('Response indicates failure, setting error result')
        console.log('Failed response data:', data)
        setResult({
          success: false,
          error: data.error || 'Backtest failed - no success flag in response'
        })
      }
    } catch (error) {
      console.error('Backtest error:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
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
               <Target className="h-5 w-5" />
               Backtesting Configuration
             </CardTitle>
             <CardDescription>
               Configure your backtesting parameters and strategy settings
             </CardDescription>
           </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momentum">Momentum Strategy</SelectItem>
                  <SelectItem value="mean_reversion">Mean Reversion Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbols">Symbols (comma-separated)</Label>
              <Input
                id="symbols"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
                placeholder="AAPL,MSFT,GOOGL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                                 <p className="text-xs text-gray-500">
                   Select your preferred start date
                 </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                                 <p className="text-xs text-gray-500">
                   Select your preferred end date
                 </p>
              </div>
            </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                 <Input
                   id="initialCapital"
                   type="number"
                   value={initialCapital}
                   onChange={(e) => setInitialCapital(Number(e.target.value))}
                   placeholder="100000"
                   min="1000"
                   step="1000"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="positionSize">Position Size (%)</Label>
                 <Input
                   id="positionSize"
                   type="number"
                   value={positionSize}
                   onChange={(e) => setPositionSize(Number(e.target.value))}
                   placeholder="0.1"
                   min="0.01"
                   max="1"
                   step="0.01"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="commission">Commission (%)</Label>
                 <Input
                   id="commission"
                   type="number"
                   value={commission}
                   onChange={(e) => setCommission(Number(e.target.value))}
                   placeholder="0.001"
                   min="0"
                   max="0.1"
                   step="0.001"
                 />
               </div>
             </div>

            <div className="flex space-x-2">
              <Button 
                onClick={runBacktest} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Backtest...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Run Backtest
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Professional backtesting platform
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Results
            </CardTitle>
            <CardDescription>
              Backtesting performance metrics and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Backtest Completed Successfully</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(result.results?.performance.total_return || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Return</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(result.results?.performance.sharpe_ratio || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {formatPercentage(result.results?.performance.max_drawdown || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Max Drawdown</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(result.results?.total_trades || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Trades</div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-800">
                      ${formatNumber(result.results?.portfolio_value || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Final Portfolio Value</div>
                  </div>

                  <Badge variant="outline" className="w-full justify-center">
                    Strategy: {strategy}
                  </Badge>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Professional backtesting results
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="text-red-600 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Backtest Failed
                  </div>
                  <div className="text-gray-600 text-sm mb-4">
                    {result.error}
                  </div>
                  <div className="text-xs text-gray-500">
                    Please check your parameters and try again. Make sure the symbols are valid and the date range is reasonable.
                  </div>
                </div>
              )
            ) : (
              <div className="text-center p-6 text-gray-500">
                <div className="mb-2">📊 Ready to Run Backtest</div>
                <div className="text-xs">
                  Configure your parameters and click "Run Backtest" to see results
                </div>
                <div className="text-xs mt-2 text-blue-600">
                  Professional backtesting platform ready
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

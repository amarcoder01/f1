'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { YahooFinanceChart, SimpleYahooFinanceChart, YahooFinanceChartWithIndicators } from '@/components/charts/YahooFinanceChart'
import { YahooFinanceChartAPI } from '@/lib/yahoo-finance-chart-api'
import { BarChart3, Settings, Zap, Download, Eye, EyeOff } from 'lucide-react'

export default function TestYahooFinanceChartPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma', 'ema', 'rsi'])

  const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
  const isConfigured = YahooFinanceChartAPI.isConfigured()
  const apiStatus = YahooFinanceChartAPI.getAPIStatus()

  const handleIndicatorToggle = (indicator: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(indicator)) {
        return prev.filter(i => i !== indicator)
      } else {
        return [...prev, indicator]
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Yahoo Finance Chart Integration Test</h1>
          <p className="text-gray-300">Test Yahoo Finance API for financial chart generation</p>
        </div>

        {/* API Status */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>API Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white">Status: {isConfigured ? 'Configured' : 'Not Configured'}</span>
              </div>
              <div className="text-gray-300">
                API Key: {apiStatus.key}
              </div>
              <div className="text-gray-300">
                Base URL: https://query1.finance.yahoo.com/v8/finance/chart
              </div>
            </div>
            
            {!isConfigured && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Configuration Required</h4>
                <p className="text-yellow-300 text-sm mb-2">
                  Please add your Yahoo Finance API key to your environment variables.
                </p>
                <code className="text-xs text-yellow-200 block bg-black/50 p-2 rounded">
                  CHARTIMG_API_KEY=your_actual_api_key_here
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Symbol Selection */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Symbol Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {testSymbols.map((symbol) => (
                <Button
                  key={symbol}
                  variant={selectedSymbol === symbol ? "default" : "outline"}
                  onClick={() => setSelectedSymbol(symbol)}
                  className="text-sm"
                >
                  {symbol}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter custom symbol (e.g., BTCUSD)"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                className="max-w-xs"
              />
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        {showAdvanced && (
          <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Advanced Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Available Intervals</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    {YahooFinanceChartAPI.getAvailableIntervals().map((int) => (
                      <div key={int.value} className="flex justify-between">
                        <span>{int.label}:</span>
                        <code className="text-purple-300">{int.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Available Ranges</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    {YahooFinanceChartAPI.getAvailableRanges().map((rng) => (
                      <div key={rng.value} className="flex justify-between">
                        <span>{rng.label}:</span>
                        <code className="text-purple-300">{rng.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Available Chart Types</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    {YahooFinanceChartAPI.getAvailableChartTypes().map((ct) => (
                      <div key={ct.value} className="flex justify-between">
                        <span>{ct.label}:</span>
                        <code className="text-purple-300">{ct.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Chart */}
          <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Basic Chart</span>
                <Badge variant="outline" className="border-green-500/30 text-green-300 bg-green-500/10">
                  Simple
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleYahooFinanceChart
                symbol={selectedSymbol}
                interval="1d"
                range="1mo"
                width={400}
                height={300}
                theme="dark"
                chartType="line"
              />
            </CardContent>
          </Card>

          {/* Chart with Indicators */}
          <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span>Chart with Indicators</span>
                <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10">
                  {selectedIndicators.length} Indicators
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <YahooFinanceChartWithIndicators
                symbol={selectedSymbol}
                indicators={selectedIndicators}
                interval="1d"
                range="1mo"
                width={400}
                height={300}
                theme="dark"
                chartType="line"
              />
            </CardContent>
          </Card>
        </div>

        {/* Full Featured Chart */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>Full Featured Chart</span>
              <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">
                Interactive
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <YahooFinanceChart
              symbol={selectedSymbol}
              interval="1d"
              range="1mo"
              width={800}
              height={500}
              theme="dark"
              chartType="line"
              indicators={selectedIndicators}
              showControls={true}
            />
          </CardContent>
        </Card>

        {/* Multiple Intervals */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Multiple Intervals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['1d', '5d', '1mo'].map((interval) => (
                <div key={interval} className="space-y-2">
                  <h4 className="text-white font-medium text-center">{interval.toUpperCase()}</h4>
                  <SimpleYahooFinanceChart
                    symbol={selectedSymbol}
                    interval={interval}
                    range="1mo"
                    width={250}
                    height={200}
                    theme="dark"
                    chartType="line"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Usage Examples</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Basic Usage</h4>
                <pre className="bg-black/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`import { YahooFinanceChart } from '@/components/charts/YahooFinanceChart'

<YahooFinanceChart 
  symbol="AAPL" 
  interval="1d" 
  range="1mo"
  width={800} 
  height={400} 
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">With Indicators</h4>
                <pre className="bg-black/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`<YahooFinanceChart 
  symbol="AAPL" 
  interval="1d" 
  range="1mo"
  indicators={['sma', 'ema', 'rsi']}
  showControls={true}
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">API Direct Usage</h4>
                <pre className="bg-black/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`import { YahooFinanceChartAPI } from '@/lib/yahoo-finance-chart-api'

const result = await YahooFinanceChartAPI.generateChartImage({
  symbol: 'AAPL',
  interval: '1d',
  range: '1mo',
  width: 800,
  height: 400,
  theme: 'dark',
  chartType: 'line',
  indicators: ['sma', 'rsi']
})`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

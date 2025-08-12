'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChartImgChart, SimpleChartImgChart, ChartImgChartWithIndicators } from '@/components/charts/ChartImgChart'
import { ChartImgAPI } from '@/lib/chartimg-api'
import { BarChart3, Settings, Zap, Download, Eye, EyeOff } from 'lucide-react'

export default function TestChartImgPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma', 'ema', 'rsi'])

  const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
  const availableIndicators = ChartImgAPI.getAvailableIndicators()
  const isConfigured = ChartImgAPI.isConfigured()
  const apiStatus = ChartImgAPI.getAPIStatus()

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
          <h1 className="text-4xl font-bold text-white mb-2">ChartImg Integration Test</h1>
          <p className="text-gray-300">Test ChartImg API for financial chart generation</p>
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
                Base URL: https://api.chartimg.com
              </div>
            </div>
            
            {!isConfigured && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Configuration Required</h4>
                <p className="text-yellow-300 text-sm mb-2">
                  Please add your ChartImg API key to your environment variables.
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
                  <h4 className="text-white font-medium mb-2">Technical Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableIndicators.map((indicator) => (
                      <Button
                        key={indicator}
                        variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleIndicatorToggle(indicator)}
                        className="text-xs"
                      >
                        {indicator.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Available Timeframes</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      {ChartImgAPI.getAvailableTimeframes().map((tf) => (
                        <div key={tf.value} className="flex justify-between">
                          <span>{tf.label}:</span>
                          <code className="text-purple-300">{tf.value}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Available Chart Types</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      {ChartImgAPI.getAvailableChartTypes().map((ct) => (
                        <div key={ct.value} className="flex justify-between">
                          <span>{ct.label}:</span>
                          <code className="text-purple-300">{ct.value}</code>
                        </div>
                      ))}
                    </div>
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
              <SimpleChartImgChart
                symbol={selectedSymbol}
                timeframe="1d"
                width={400}
                height={300}
                theme="dark"
                chartType="candlestick"
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
              <ChartImgChartWithIndicators
                symbol={selectedSymbol}
                indicators={selectedIndicators}
                timeframe="1d"
                width={400}
                height={300}
                theme="dark"
                chartType="candlestick"
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
            <ChartImgChart
              symbol={selectedSymbol}
              timeframe="1d"
              width={800}
              height={500}
              theme="dark"
              chartType="candlestick"
              indicators={selectedIndicators}
              showControls={true}
            />
          </CardContent>
        </Card>

        {/* Multiple Timeframes */}
        <Card className="bg-black/20 border border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Multiple Timeframes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['1d', '5d', '1mo'].map((timeframe) => (
                <div key={timeframe} className="space-y-2">
                  <h4 className="text-white font-medium text-center">{timeframe.toUpperCase()}</h4>
                  <SimpleChartImgChart
                    symbol={selectedSymbol}
                    timeframe={timeframe}
                    width={250}
                    height={200}
                    theme="dark"
                    chartType="candlestick"
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
{`import { ChartImgChart } from '@/components/charts/ChartImgChart'

<ChartImgChart 
  symbol="AAPL" 
  timeframe="1d" 
  width={800} 
  height={400} 
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">With Technical Indicators</h4>
                <pre className="bg-black/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`<ChartImgChart 
  symbol="AAPL" 
  timeframe="1d" 
  indicators={['sma', 'ema', 'rsi', 'macd']}
  showControls={true}
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">API Direct Usage</h4>
                <pre className="bg-black/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`import { ChartImgAPI } from '@/lib/chartimg-api'

const result = await ChartImgAPI.generateChart({
  symbol: 'AAPL',
  timeframe: '1d',
  width: 800,
  height: 400,
  theme: 'dark',
  chartType: 'candlestick',
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

'use client'

import React, { useState } from 'react'
import { TremorStockChart } from '@/components/charts/TremorStockChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export default function TestEnhancedChartPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [chartHeight, setChartHeight] = useState(500)

  const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
            Tremor Chart Testing
          </h1>
          <p className="text-gray-300 text-lg">
            Test the new Tremor-based chart component with multiple chart types
          </p>
        </motion.div>

        {/* Symbol Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Select Stock Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {testSymbols.map((symbol) => (
                  <Button
                    key={symbol}
                    variant={selectedSymbol === symbol ? "default" : "outline"}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={
                      selectedSymbol === symbol
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                    }
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart Height Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Chart Height Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">Height:</span>
                <div className="flex space-x-2">
                  {[300, 400, 500, 600, 700].map((height) => (
                    <Button
                      key={height}
                      variant={chartHeight === height ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartHeight(height)}
                      className={
                        chartHeight === height
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                      }
                    >
                      {height}px
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>Tremor Chart for {selectedSymbol}</span>
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                  Multiple Chart Types
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TremorStockChart
                symbol={selectedSymbol}
                height={chartHeight}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Chart Types Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Line Chart</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Area Chart</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Bar Chart</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Candlestick (Line-based)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Volume Display</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Real-time Updates</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Multiple Timeframes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Volume Display</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Interactive Controls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Responsive Design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">✓</Badge>
                  <span className="text-gray-300">Professional Charts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-300">
                <p>1. <strong>Select a Stock Symbol:</strong> Choose from the available symbols above</p>
                <p>2. <strong>Change Chart Type:</strong> Use the chart type buttons in the chart controls</p>
                <p>3. <strong>Adjust Timeframe:</strong> Select different time periods (1D, 5D, 1M, etc.)</p>
                <p>4. <strong>Toggle Volume:</strong> Show/hide volume bars below the price chart</p>
                <p>5. <strong>Resize Chart:</strong> Adjust the chart height using the height controls</p>
                <p>6. <strong>Interactive Features:</strong> Hover over the chart for crosshair, zoom with mouse wheel</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

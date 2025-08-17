'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MarketData {
  name: string
  value: number
  change: number
  changePercent: number
  volume?: string
}

const defaultMarketData: MarketData[] = [
  {
    name: 'S&P 500',
    value: 4567.89,
    change: 23.45,
    changePercent: 0.52,
    volume: '2.3B'
  },
  {
    name: 'NASDAQ',
    value: 14234.56,
    change: -45.67,
    changePercent: -0.32,
    volume: '3.4B'
  },
  {
    name: 'Dow Jones',
    value: 34567.89,
    change: 123.45,
    changePercent: 0.36,
    volume: '1.2B'
  },
  {
    name: 'Russell 2000',
    value: 1890.45,
    change: 12.34,
    changePercent: 0.66,
    volume: '0.8B'
  }
]

interface MarketAnalysisProps {
  data?: MarketData[]
}

export function MarketAnalysis({ data = defaultMarketData }: MarketAnalysisProps) {
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="bg-black/20 border-purple-800/30 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">{item.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.changePercent >= 0 
                        ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                        : 'border-red-500/30 text-red-400 bg-red-500/10'
                    }`}
                  >
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">
                      {item.value.toLocaleString()}
                    </span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(item.change)}`}>
                      {getChangeIcon(item.change)}
                      <span className="text-sm">
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {item.volume && (
                    <div className="text-xs text-gray-400">
                      Volume: {item.volume}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Market Sentiment */}
      <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>Market Sentiment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">Bullish</div>
              <div className="text-sm text-gray-400">Market Outlook</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">Neutral</div>
              <div className="text-sm text-gray-400">Volatility Index</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">High</div>
              <div className="text-sm text-gray-400">Trading Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card className="bg-black/20 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>Sector Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Technology', change: 2.3, color: 'text-blue-400' },
              { name: 'Healthcare', change: -0.8, color: 'text-green-400' },
              { name: 'Financial', change: 1.2, color: 'text-yellow-400' },
              { name: 'Energy', change: -1.1, color: 'text-red-400' },
              { name: 'Consumer', change: 0.5, color: 'text-purple-400' }
            ].map((sector, index) => (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-purple-800/30 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${sector.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-white font-medium">{sector.name}</span>
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(sector.change)}`}>
                  {getChangeIcon(sector.change)}
                  <span className="font-semibold">
                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MarketOverview() {
  // Using static market data since Market Overview API has been removed
  const marketData: MarketData[] = defaultMarketData
  
  // Simple market status based on current time (ET)
  const now = new Date()
  const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  const hour = etTime.getHours()
  const day = etTime.getDay()
  const isWeekday = day >= 1 && day <= 5
  const isMarketHours = hour >= 9 && hour < 16
  const isOpen = isWeekday && isMarketHours

  return (
    <div className="space-y-4">
      {/* Market Status Banner */}
      <div className={`p-4 rounded-lg border ${
        isOpen 
          ? 'bg-green-900/20 border-green-500/30 text-green-300' 
          : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="font-semibold">
              Market {isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-sm opacity-75">
              ({isOpen ? 'REGULAR TRADING' : 'AFTER HOURS'})
            </span>
          </div>
          <div className="text-sm opacity-75">
            {isOpen ? 'Trading in progress' : 'Market closed'}
          </div>
        </div>
        <div className="mt-2 text-sm opacity-75">
          Last Updated: {etTime.toLocaleString()} ET • Static Data
        </div>
      </div>
      
      {/* Market Analysis Component */}
      <MarketAnalysis data={marketData} />
    </div>
  )
}

export function TopGainers() {
  const gainersData: MarketData[] = [
    { name: 'AAPL', value: 185.50, change: 2.34, changePercent: 1.28 },
    { name: 'TSLA', value: 245.20, change: 1.89, changePercent: 0.78 },
    { name: 'NVDA', value: 520.50, change: 4.12, changePercent: 0.80 },
    { name: 'MSFT', value: 320.75, change: 1.89, changePercent: 0.59 }
  ]
  
  return <MarketAnalysis data={gainersData} />
}

export function TopLosers() {
  const losersData: MarketData[] = [
    { name: 'META', value: 320.40, change: -1.23, changePercent: -0.38 },
    { name: 'NFLX', value: 485.60, change: -0.89, changePercent: -0.18 },
    { name: 'GOOGL', value: 145.20, change: -0.75, changePercent: -0.51 },
    { name: 'AMZN', value: 155.30, change: -0.45, changePercent: -0.29 }
  ]
  
  return <MarketAnalysis data={losersData} />
}

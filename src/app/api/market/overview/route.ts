import { NextRequest, NextResponse } from 'next/server'
import { yahooFinanceSimple } from '@/lib/yahoo-finance-simple'

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

interface SectorPerformance {
  name: string
  change: number
  stocks: string[]
  description: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching market overview data')

    // Major market indices
    const indices = ['^GSPC', '^IXIC', '^DJI', '^RUT']
    const marketData: MarketIndex[] = []

    for (const symbol of indices) {
      try {
        const data = await yahooFinanceSimple.getStockData(symbol)
        if (data) {
          marketData.push({
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume
          })
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
      }
    }

    // Sector performance data
    const sectorPerformance: SectorPerformance[] = [
      {
        name: 'Technology',
        change: 2.3,
        stocks: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'],
        description: 'Software, hardware, and internet services'
      },
      {
        name: 'Healthcare',
        change: -0.8,
        stocks: ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO'],
        description: 'Pharmaceuticals, biotech, and medical devices'
      },
      {
        name: 'Financial',
        change: 1.2,
        stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
        description: 'Banks, insurance, and financial services'
      },
      {
        name: 'Consumer',
        change: 0.5,
        stocks: ['AMZN', 'HD', 'MCD', 'COST', 'SBUX'],
        description: 'Retail, restaurants, and consumer goods'
      },
      {
        name: 'Energy',
        change: -1.1,
        stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB'],
        description: 'Oil, gas, and renewable energy'
      },
      {
        name: 'Industrial',
        change: 0.9,
        stocks: ['CAT', 'BA', 'MMM', 'GE', 'HON'],
        description: 'Manufacturing, aerospace, and construction'
      }
    ]

    // Calculate market sentiment
    const totalChange = marketData.reduce((sum, index) => sum + index.changePercent, 0)
    const averageChange = marketData.length > 0 ? totalChange / marketData.length : 0
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (averageChange > 0.5) sentiment = 'bullish'
    else if (averageChange < -0.5) sentiment = 'bearish'

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      indices: marketData,
      sectors: sectorPerformance,
      sentiment: {
        overall: sentiment,
        averageChange: averageChange,
        gainers: marketData.filter(i => i.changePercent > 0).length,
        losers: marketData.filter(i => i.changePercent < 0).length
      },
      volume: {
        total: marketData.reduce((sum, index) => sum + index.volume, 0),
        average: marketData.reduce((sum, index) => sum + index.volume, 0) / marketData.length
      }
    })

  } catch (error) {
    console.error('Market overview error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch market overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

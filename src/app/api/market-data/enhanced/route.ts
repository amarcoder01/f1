import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const period = searchParams.get('period') || '1d'
    const interval = searchParams.get('interval') || '1m'

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    // Enhanced data structure
    const enhancedData = {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      current: await getCurrentData(symbol),
      historical: await getHistoricalData(symbol, period, interval),
      technical: await getTechnicalIndicators(symbol),
      sentiment: await getMarketSentiment(symbol),
      fundamentals: await getEnhancedFundamentals(symbol),
      news: await getRecentNews(symbol)
    }

    return NextResponse.json({
      success: true,
      data: enhancedData
    })

  } catch (error) {
    console.error('Enhanced Market Data API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enhanced market data' },
      { status: 500 }
    )
  }
}

async function getCurrentData(symbol: string) {
  try {
    // Use existing stock quote API as base
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stocks/quote?symbol=${symbol}`)
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        return {
          price: data.data.price || 0,
          change: data.data.change || 0,
          changePercent: data.data.changePercent || 0,
          volume: data.data.volume || 0,
          marketCap: data.data.marketCap || 0,
          pe: data.data.pe || 0,
          dividendYield: data.data.dividendYield || 0,
          beta: data.data.beta || 0,
          high52Week: data.data.high52Week || 0,
          low52Week: data.data.low52Week || 0,
          sector: data.data.sector || 'Unknown',
          industry: data.data.industry || 'Unknown',
          name: data.data.name || symbol
        }
      }
    }
  } catch (error) {
    console.error('Error fetching current data:', error)
  }

  // Fallback mock data
  return {
    price: Math.random() * 200 + 50,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.random() * 10000000 + 1000000,
    marketCap: Math.random() * 1000000000000 + 10000000000,
    pe: Math.random() * 50 + 10,
    dividendYield: Math.random() * 5,
    beta: Math.random() * 2 + 0.5,
    high52Week: Math.random() * 50 + 150,
    low52Week: Math.random() * 50 + 50,
    sector: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy'][Math.floor(Math.random() * 5)],
    industry: 'General',
    name: symbol
  }
}

async function getHistoricalData(symbol: string, period: string, interval: string) {
  try {
    // Mock historical data - in real implementation, this would fetch from a data provider
    const now = new Date()
    const dataPoints = period === '1d' ? 390 : period === '5d' ? 1950 : period === '1mo' ? 7800 : 23400
    const historicalData = []

    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(now.getTime() - i * (period === '1d' ? 60000 : period === '5d' ? 60000 : 60000))
      const basePrice = 100 + Math.sin(i * 0.1) * 20 + Math.random() * 10
      
      historicalData.push({
        timestamp: date.toISOString(),
        open: basePrice + Math.random() * 2 - 1,
        high: basePrice + Math.random() * 3,
        low: basePrice - Math.random() * 3,
        close: basePrice + Math.random() * 2 - 1,
        volume: Math.random() * 1000000 + 500000
      })
    }

    return historicalData
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

async function getTechnicalIndicators(symbol: string) {
  try {
    // Mock technical indicators - in real implementation, these would be calculated from historical data
    return {
      rsi: Math.random() * 100,
      macd: {
        macd: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 2,
        histogram: (Math.random() - 0.5) * 1
      },
      bollingerBands: {
        upper: 120 + Math.random() * 10,
        middle: 110 + Math.random() * 5,
        lower: 100 + Math.random() * 10
      },
      movingAverages: {
        sma20: 105 + Math.random() * 10,
        sma50: 108 + Math.random() * 8,
        sma200: 112 + Math.random() * 6
      },
      support: 95 + Math.random() * 10,
      resistance: 125 + Math.random() * 10
    }
  } catch (error) {
    console.error('Error calculating technical indicators:', error)
    return {}
  }
}

async function getMarketSentiment(symbol: string) {
  try {
    // Mock sentiment data - in real implementation, this would come from news APIs and social media
    return {
      overall: Math.random() * 100,
      news: Math.random() * 100,
      social: Math.random() * 100,
      analyst: Math.random() * 100,
      institutional: Math.random() * 100,
      retail: Math.random() * 100,
      fearGreedIndex: Math.random() * 100,
      putCallRatio: Math.random() * 2 + 0.5
    }
  } catch (error) {
    console.error('Error fetching sentiment data:', error)
    return {}
  }
}

async function getEnhancedFundamentals(symbol: string) {
  try {
    // Mock enhanced fundamentals - in real implementation, this would come from financial data providers
    return {
      revenue: Math.random() * 100000000000 + 10000000000,
      revenueGrowth: (Math.random() - 0.5) * 20,
      earnings: Math.random() * 10000000000 + 1000000000,
      earningsGrowth: (Math.random() - 0.5) * 30,
      profitMargin: Math.random() * 30 + 5,
      debtToEquity: Math.random() * 2 + 0.1,
      currentRatio: Math.random() * 3 + 1,
      returnOnEquity: Math.random() * 25 + 5,
      returnOnAssets: Math.random() * 15 + 3,
      freeCashFlow: Math.random() * 5000000000 + 1000000000,
      bookValue: Math.random() * 50 + 10,
      priceToBook: Math.random() * 5 + 1,
      priceToSales: Math.random() * 10 + 1,
      enterpriseValue: Math.random() * 200000000000 + 50000000000,
      evToEbitda: Math.random() * 20 + 5
    }
  } catch (error) {
    console.error('Error fetching fundamentals:', error)
    return {}
  }
}

async function getRecentNews(symbol: string) {
  try {
    // Mock news data - in real implementation, this would come from news APIs
    const mockNews = [
      {
        title: `${symbol} Reports Strong Q4 Earnings`,
        summary: 'Company exceeds analyst expectations with robust revenue growth',
        sentiment: 'positive',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: 'Financial Times'
      },
      {
        title: `${symbol} Announces New Product Launch`,
        summary: 'Innovative solution expected to drive future growth',
        sentiment: 'positive',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: 'Reuters'
      },
      {
        title: `${symbol} Faces Regulatory Challenges`,
        summary: 'New regulations may impact business operations',
        sentiment: 'negative',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        source: 'Bloomberg'
      }
    ]

    return mockNews.sort(() => Math.random() - 0.5).slice(0, 3)
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

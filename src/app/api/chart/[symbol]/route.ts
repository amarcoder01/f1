import { NextRequest, NextResponse } from 'next/server'
import { YahooFinanceChartAPI } from '@/lib/yahoo-finance-chart-api'

interface ChartDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjClose?: number
  change?: number
  changePercent?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '1d'
    const interval = searchParams.get('interval') || '1m'
    
    const symbol = params.symbol

    console.log(`📊 Fetching chart data for ${symbol} with range: ${range}, interval: ${interval}`)

    // Yahoo Finance API is always available (no authentication required)
    console.log('Yahoo Finance API is available')

    try {
      // Use Yahoo Finance API to get real chart data
      const result = await YahooFinanceChartAPI.fetchChartData({
        symbol,
        interval,
        range
      })
      
      if (result.success && result.data) {
        // Convert Yahoo Finance data to chart format
        const chartData = convertYahooFinanceToChartData(result.data, symbol)
        console.log(`API: Successfully fetched ${chartData.length} data points for ${symbol}`)
        return NextResponse.json({
          success: true,
          data: chartData,
          source: 'yahoo_finance',
          dataPoints: chartData.length
        })
      } else {
        console.warn(`API: No chart data from Yahoo Finance for ${symbol}, using fallback`)
        const fallbackData = generateFallbackData(symbol, range)
        return NextResponse.json({
          success: true,
          data: fallbackData,
          source: 'fallback',
          message: 'No data from Yahoo Finance API, using sample data'
        })
      }
    } catch (yahooError) {
      console.error(`API: Yahoo Finance chart data failed for ${symbol}:`, yahooError)
      const fallbackData = generateFallbackData(symbol, range)
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback',
        error: yahooError instanceof Error ? yahooError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('API: Chart data error:', error)
    const fallbackData = generateFallbackData(params.symbol, '1d')
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: fallbackData,
      source: 'fallback'
    }, { status: 500 })
  }
}

// Convert Yahoo Finance data to chart format
function convertYahooFinanceToChartData(yahooData: any, symbol: string): ChartDataPoint[] {
  try {
    const chartData = yahooData.chart
    if (!chartData || !chartData.result || !chartData.result[0]) {
      console.warn('Invalid Yahoo Finance data structure')
      return generateFallbackData(symbol, '1d')
    }

    const result = chartData.result[0]
    const timestamps = result.timestamp
    const quotes = result.indicators.quote[0]
    
    if (!timestamps || !quotes) {
      console.warn('Missing timestamp or quote data')
      return generateFallbackData(symbol, '1d')
    }

    const chartPoints: ChartDataPoint[] = []
    
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i]
      const open = quotes.open[i] || 0
      const high = quotes.high[i] || 0
      const low = quotes.low[i] || 0
      const close = quotes.close[i] || 0
      const volume = quotes.volume[i] || 0

      if (open > 0 && high > 0 && low > 0 && close > 0) {
        chartPoints.push({
          time: timestamp * 1000, // Convert to milliseconds
          open,
          high,
          low,
          close,
          volume,
          change: close - open,
          changePercent: ((close - open) / open) * 100
        })
      }
    }

    console.log(`Converted ${chartPoints.length} data points from Yahoo Finance`)
    return chartPoints
  } catch (error) {
    console.error('Error converting Yahoo Finance data:', error)
    return generateFallbackData(symbol, '1d')
  }
}

// Generate fallback chart data
function generateFallbackData(symbol: string, range: string): ChartDataPoint[] {
  console.log(`Generating fallback data for ${symbol} (${range})`)
  
  // Base prices for known symbols
  const basePrices: { [key: string]: number } = {
    'AAPL': 180,
    'MSFT': 380,
    'GOOGL': 140,
    'TSLA': 250,
    'AMZN': 145,
    'NVDA': 450,
    'META': 300,
    'NFLX': 400
  }
  
  const basePrice = basePrices[symbol] || (100 + Math.random() * 400)
  const dataPoints: ChartDataPoint[] = []
  const now = Date.now()
  
  // Generate data points based on range
  let numPoints = 100
  let timeInterval = 24 * 60 * 60 * 1000 // 1 day
  
  switch (range) {
    case '1d':
      numPoints = 390 // Market minutes
      timeInterval = 60 * 1000 // 1 minute
      break
    case '5d':
      numPoints = 390 * 5
      timeInterval = 60 * 1000
      break
    case '1mo':
      numPoints = 30
      timeInterval = 24 * 60 * 60 * 1000
      break
    case '3mo':
      numPoints = 90
      timeInterval = 24 * 60 * 60 * 1000
      break
    case '6mo':
      numPoints = 180
      timeInterval = 24 * 60 * 60 * 1000
      break
    case '1y':
      numPoints = 252
      timeInterval = 24 * 60 * 60 * 1000
      break
    case '5y':
      numPoints = 1260
      timeInterval = 24 * 60 * 60 * 1000
      break
  }
  
  let currentPrice = basePrice
  
  for (let i = 0; i < numPoints; i++) {
    const time = now - (numPoints - i) * timeInterval
    
    // Random walk with slight upward bias
    const volatility = 0.02
    const change = (Math.random() - 0.48) * volatility
    currentPrice = currentPrice * (1 + change)
    
    const high = currentPrice * (1 + Math.random() * 0.01)
    const low = currentPrice * (1 - Math.random() * 0.01)
    const open = currentPrice * (1 + (Math.random() - 0.5) * 0.005)
    const close = currentPrice
    const volume = Math.random() * 1000000 + 100000

    dataPoints.push({
      time,
      open,
      high,
      low,
      close,
      volume,
      change: close - open,
      changePercent: ((close - open) / open) * 100
    })
  }
  
  return dataPoints
}

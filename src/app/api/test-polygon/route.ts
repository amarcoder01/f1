import { NextRequest, NextResponse } from 'next/server'
import { PolygonChartAPI } from '@/lib/polygon-chart-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const timeframe = searchParams.get('timeframe') || '1d'

  try {
    console.log(`Testing Polygon API for ${symbol} with timeframe ${timeframe}`)
    
    // Check if API is configured
    const apiStatus = PolygonChartAPI.getAPIStatus()
    console.log('Polygon API Status:', apiStatus)
    
    if (!apiStatus.configured) {
      return NextResponse.json({
        success: false,
        error: 'Polygon API not configured',
        message: 'Please set POLYGON_API_KEY environment variable',
        apiStatus,
        fallbackData: PolygonChartAPI.generateFallbackData(symbol, timeframe).slice(0, 5)
      })
    }

    // Try to fetch real data
    const chartData = await PolygonChartAPI.getChartData(symbol, timeframe)
    
    return NextResponse.json({
      success: true,
      symbol,
      timeframe,
      dataPoints: chartData.length,
      sampleData: chartData.slice(0, 3),
      apiStatus
    })

  } catch (error) {
    console.error('Polygon API test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      symbol,
      timeframe,
      apiStatus: PolygonChartAPI.getAPIStatus(),
      fallbackData: PolygonChartAPI.generateFallbackData(symbol, timeframe).slice(0, 5)
    })
  }
}
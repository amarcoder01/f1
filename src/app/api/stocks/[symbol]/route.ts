import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Fetching stock data for ${symbol}...`)

    // Simple market status check (9:30 AM - 4:00 PM ET, Monday-Friday)
    const now = new Date()
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
    const day = etTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = etTime.getHours()
    const minute = etTime.getMinutes()
    const timeInMinutes = hour * 60 + minute
    
    const marketStatus = {
      isOpen: day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes < 960, // 9:30 AM to 4:00 PM ET
      status: (day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes < 960) ? 'open' : 'closed'
    }
    
    let stockData = null

    const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY
    
    if (!POLYGON_API_KEY) {
      return NextResponse.json(
        { error: 'Polygon API key not configured' },
        { status: 500 }
      )
    }

    if (marketStatus.isOpen) {
      // Try to get real-time data first
      try {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const toDate = now.toISOString().split('T')[0]
        const fromDate = oneDayAgo.toISOString().split('T')[0]
        
        const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apikey=${POLYGON_API_KEY}`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const latest = data.results[data.results.length - 1]
            const previous = data.results[data.results.length - 2] || latest
            
            stockData = {
              symbol,
              name: `${symbol} Company`, // You would get this from a company info API
              price: latest.c,
              change: latest.c - previous.c,
              changePercent: ((latest.c - previous.c) / previous.c) * 100,
              volume: latest.v,
              marketCap: latest.v * latest.c, // Simplified calculation
              exchange: 'NASDAQ', // You would get this from company info
              sector: 'Technology', // You would get this from company info
              lastUpdated: new Date(latest.t).toISOString(),
              dataSource: 'real-time' as const
            }
          }
        }
      } catch (error) {
        console.log(`Real-time data not available for ${symbol}, trying previous close...`)
      }
    }

    // If real-time failed or market is closed, get previous close
    if (!stockData) {
      try {
        const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apikey=${POLYGON_API_KEY}`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            const previousDay = data.results[1] || result
            
            stockData = {
              symbol,
              name: `${symbol} Company`,
              price: result.c,
              change: result.c - previousDay.c,
              changePercent: ((result.c - previousDay.c) / previousDay.c) * 100,
              volume: result.v,
              marketCap: result.v * result.c,
              exchange: 'NASDAQ',
              sector: 'Technology',
              lastUpdated: new Date(result.t).toISOString(),
              dataSource: 'previous-close' as const
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching previous close for ${symbol}:`, error)
      }
    }

    if (!stockData) {
      return NextResponse.json(
        { error: `No data available for ${symbol}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stock: stockData,
      marketStatus: {
        isOpen: marketStatus.isOpen,
        status: marketStatus.status
      }
    })

  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
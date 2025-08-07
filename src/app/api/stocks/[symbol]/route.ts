// API Route for getting individual stock data via Polygon.io
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'

const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const POLYGON_BASE_URL = 'https://api.polygon.io'

interface PolygonSnapshotResponse {
  status: string
  results?: Array<{
    value: {
      ticker: string
      todaysChangePerc: number
      todaysChange: number
      updated: number
      timeframe: string
      min?: {
        av: number
        c: number
        h: number
        l: number
        o: number
        t: number
        v: number
        vw: number
      }
      prevDay?: {
        c: number
        h: number
        l: number
        o: number
        v: number
        vw: number
      }
      day?: {
        c: number
        h: number
        l: number
        o: number
        v: number
        vw: number
      }
    }
  }>
}

// Helper function to map company name to sector
function getSectorFromName(name: string): string {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('technology') || lowerName.includes('software') || lowerName.includes('computer') || lowerName.includes('internet')) {
    return 'Technology'
  } else if (lowerName.includes('pharmaceutical') || lowerName.includes('medical') || lowerName.includes('health') || lowerName.includes('biotechnology')) {
    return 'Healthcare'
  } else if (lowerName.includes('bank') || lowerName.includes('financial') || lowerName.includes('insurance') || lowerName.includes('investment')) {
    return 'Financials'
  } else if (lowerName.includes('retail') || lowerName.includes('consumer') || lowerName.includes('restaurant') || lowerName.includes('automotive')) {
    return 'Consumer Discretionary'
  } else if (lowerName.includes('energy') || lowerName.includes('oil') || lowerName.includes('gas') || lowerName.includes('petroleum')) {
    return 'Energy'
  } else if (lowerName.includes('manufacturing') || lowerName.includes('industrial') || lowerName.includes('aerospace') || lowerName.includes('defense')) {
    return 'Industrials'
  } else if (lowerName.includes('telecommunication') || lowerName.includes('media') || lowerName.includes('entertainment') || lowerName.includes('broadcasting')) {
    return 'Communication Services'
  } else if (lowerName.includes('food') || lowerName.includes('beverage') || lowerName.includes('household') || lowerName.includes('personal care')) {
    return 'Consumer Staples'
  } else if (lowerName.includes('utility') || lowerName.includes('electric') || lowerName.includes('water') || lowerName.includes('gas distribution')) {
    return 'Utilities'
  } else if (lowerName.includes('real estate') || lowerName.includes('reit') || lowerName.includes('property')) {
    return 'Real Estate'
  } else if (lowerName.includes('mining') || lowerName.includes('chemical') || lowerName.includes('materials') || lowerName.includes('metals')) {
    return 'Materials'
  } else {
    return 'Technology' // Default sector
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    // Check if API key is available
    if (!POLYGON_API_KEY) {
      return NextResponse.json({ 
        error: 'Polygon API key not configured. Please add POLYGON_API_KEY to your .env file.' 
      }, { status: 500 })
    }

    const symbol = params.symbol.toUpperCase()

    console.log('API: Fetching stock data for:', symbol)

    // Get current snapshot data
    const snapshotUrl = `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${POLYGON_API_KEY}`
    console.log('API: Snapshot URL:', snapshotUrl.replace(POLYGON_API_KEY, '[HIDDEN]'))
    
    const snapshotResponse = await fetch(snapshotUrl)

    if (!snapshotResponse.ok) {
      console.error('API: Snapshot API error:', snapshotResponse.status, snapshotResponse.statusText)
      return NextResponse.json({ error: `Stock not found: ${symbol}` }, { status: 404 })
    }

    const snapshotData: PolygonSnapshotResponse = await snapshotResponse.json()
    
    if (!snapshotData.results || snapshotData.results.length === 0) {
      console.log('API: No snapshot data for:', symbol)
      return NextResponse.json({ error: `No data available for: ${symbol}` }, { status: 404 })
    }

    const snapshot = snapshotData.results[0].value

    // Try to get ticker details for company info
    const detailsUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apikey=${POLYGON_API_KEY}`
    let companyName = `${symbol} Inc.`
    let exchange: 'NYSE' | 'NASDAQ' | 'OTC' = 'NASDAQ'
    let sector = 'Technology'

    try {
      const detailsResponse = await fetch(detailsUrl)
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json()
        if (detailsData.results) {
          companyName = detailsData.results.name || companyName
          if (detailsData.results.primary_exchange === 'XNYS') {
            exchange = 'NYSE'
          } else if (detailsData.results.primary_exchange === 'XNAS') {
            exchange = 'NASDAQ'
          } else {
            exchange = 'OTC'
          }
          sector = getSectorFromName(companyName)
        }
      }
    } catch (error) {
      console.log(`API: Details fetch failed for ${symbol}, using defaults`)
    }

    // Extract data
    const currentPrice = snapshot.day?.c || snapshot.prevDay?.c || 0
    const previousClose = snapshot.prevDay?.c || currentPrice
    const change = snapshot.todaysChange || (currentPrice - previousClose)
    const changePercent = snapshot.todaysChangePerc || ((change / previousClose) * 100)

    // Map to our Stock interface
    const stock: Stock = {
      symbol: symbol,
      name: companyName,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: snapshot.day?.v || snapshot.prevDay?.v || 0,
      marketCap: 0, // Not provided by current endpoint
      pe: 0, // Not provided by current endpoint
      dividend: 0, // Not provided by current endpoint
      sector: sector,
      industry: sector,
      exchange: exchange,
      dayHigh: snapshot.day?.h || snapshot.prevDay?.h || currentPrice,
      dayLow: snapshot.day?.l || snapshot.prevDay?.l || currentPrice,
      fiftyTwoWeekHigh: 0, // Not provided by current endpoint
      fiftyTwoWeekLow: 0, // Not provided by current endpoint
      avgVolume: snapshot.min?.av || snapshot.day?.v || 0,
      dividendYield: 0, // Not provided by current endpoint
      beta: 0, // Not provided by current endpoint
      eps: 0, // Not provided by current endpoint
      lastUpdated: new Date().toISOString()
    }

    console.log(`API: Successfully fetched data for ${symbol}:`, stock.name, stock.price)
    return NextResponse.json(stock)

  } catch (error) {
    console.error('API: Error fetching stock:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
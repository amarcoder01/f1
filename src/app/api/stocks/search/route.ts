// API Route for searching US stocks via yfinance
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface PolygonTickerResponse {
  status: string
  results?: Array<{
    ticker: string
    name: string
    market: string
    locale: string
    primary_exchange: string
    type: string
    active: boolean
    currency_name: string
    cik?: string
    composite_figi?: string
    share_class_figi?: string
    last_updated_utc?: string
  }>
  next_url?: string
}

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

// Helper function to map SIC description to sector
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] })
    }

    console.log('API: Searching for stocks:', query)

    // Use yfinance to search stocks
    const { stdout, stderr } = await execAsync(`python scripts/yfinance_search.py "${query}"`)

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    const result = JSON.parse(stdout.trim())
    
    if (!result.success) {
      console.log(`API: yfinance search failed:`, result.error)
      return NextResponse.json({ results: [] })
    }

    console.log(`API: Successfully found ${result.stocks.length} stocks via yfinance`)
    return NextResponse.json({ results: result.stocks })

  } catch (error) {
    console.error('API: Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getStockData(symbol: string): Promise<Stock | null> {
  try {
    const ticker = symbol.toUpperCase()

    // Get current snapshot data
    const snapshotUrl = `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${POLYGON_API_KEY}`
    const snapshotResponse = await fetch(snapshotUrl)

    if (!snapshotResponse.ok) {
      console.log(`API: Snapshot failed for ${ticker}:`, snapshotResponse.status)
      return null
    }

    const snapshotData: PolygonSnapshotResponse = await snapshotResponse.json()
    
    if (!snapshotData.results || snapshotData.results.length === 0) {
      console.log(`API: No snapshot data for ${ticker}`)
      return null
    }

    const snapshot = snapshotData.results[0].value

    // Try to get ticker details for company info
    const detailsUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}?apikey=${POLYGON_API_KEY}`
    let companyName = `${ticker} Inc.`
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
      console.log(`API: Details fetch failed for ${ticker}, using defaults`)
    }

    // Extract data
    const currentPrice = snapshot.day?.c || snapshot.prevDay?.c || 0
    const previousClose = snapshot.prevDay?.c || currentPrice
    const change = snapshot.todaysChange || (currentPrice - previousClose)
    const changePercent = snapshot.todaysChangePerc || ((change / previousClose) * 100)

    // Map to our Stock interface
    const stock: Stock = {
      symbol: ticker,
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

    console.log(`API: Successfully fetched data for ${ticker}`)
    return stock

  } catch (error) {
    console.error(`API: Error fetching stock data for ${symbol}:`, error)
    return null
  }
}
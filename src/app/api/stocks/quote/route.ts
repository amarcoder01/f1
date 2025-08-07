// API Route for fetching current stock quote data using yfinance
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 })
    }

    console.log('API: Fetching quote for symbol:', symbol)

    // Use yfinance to get stock data
    const { stdout, stderr } = await execAsync(`python scripts/yfinance_quote.py "${symbol}"`)

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    const result = JSON.parse(stdout.trim())
    
    if (!result.success) {
      console.log(`API: yfinance failed for ${symbol}:`, result.error)
      return NextResponse.json({ error: `Failed to fetch data for ${symbol}` }, { status: 404 })
    }

    console.log(`API: Successfully fetched quote for ${symbol} via yfinance`)
    return NextResponse.json({ stock: result.stock })

  } catch (error) {
    console.error('API: Quote fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY

interface StockPrice {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: {
    T: string // ticker
    v: number // volume
    vw: number // volume weighted average price
    o: number // open price
    c: number // close price
    h: number // high price
    l: number // low price
    t: number // timestamp
    n: number // number of transactions
  }[]
  status: string
  request_id: string
  next_url?: string
}

interface StockDetails {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  isMarketClosed: boolean
}

async function makePolygonRequest(endpoint: string): Promise<any> {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon API key is not configured')
  }

  const url = `https://api.polygon.io${endpoint}?apikey=${POLYGON_API_KEY}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Polygon.io API key configuration.')
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your Polygon.io subscription plan.')
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'ERROR') {
      throw new Error(data.error || 'API returned an error')
    }
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error occurred while fetching data')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params

    if (!POLYGON_API_KEY) {
      return NextResponse.json(
        { error: 'Polygon API key is not configured' },
        { status: 500 }
      )
    }

    const response: StockPrice = await makePolygonRequest(`/v2/aggs/ticker/${ticker}/prev`)
    
    if (!response.results || response.results.length === 0) {
      return NextResponse.json(
        { error: 'No data available for this stock' },
        { status: 404 }
      )
    }

    const result = response.results[0]
    const price = result.c // close price
    const previousClose = result.o // open price as previous close
    const change = price - previousClose
    const changePercent = (change / previousClose) * 100
    
    // Check if market is closed (simplified check)
    const now = new Date()
    const marketCloseTime = new Date()
    marketCloseTime.setHours(16, 0, 0, 0) // 4 PM EST
    const isMarketClosed = now > marketCloseTime
    
    const stockDetails: StockDetails = {
      ticker: result.T,
      name: ticker, // We'll need to get this from the stock list
      price,
      change,
      changePercent,
      previousClose,
      isMarketClosed
    }

    return NextResponse.json(stockDetails)
  } catch (error) {
    console.error('Error fetching stock details:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stock details' },
      { status: 500 }
    )
  }
}

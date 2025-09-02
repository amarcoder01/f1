import { NextRequest, NextResponse } from 'next/server'

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY

interface PolygonTickerData {
  ticker: string
  day?: {
    c: number // close price
    h: number // high
    l: number // low
    o: number // open
    v: number // volume
    vw: number // volume weighted average price
  }
  min?: {
    av: number // accumulated volume
    t: number // timestamp
    n: number // number of transactions
    o: number // open price
    h: number // high price
    l: number // low price
    c: number // close price
    v: number // volume
    vw: number // volume weighted average price
  }
  prevDay?: {
    c: number // previous close
    h: number
    l: number
    o: number
    v: number
    vw: number
  }
  todaysChange?: number
  todaysChangePerc?: number
  updated?: number
  fmv?: number // fair market value
}

interface PolygonApiResponse {
  status: string
  tickers: PolygonTickerData[]
  count?: number
}

interface StockData {
  ticker: string
  name: string
  market_cap: number
  value: number
  change: number
  change_percent: number
}

interface ApiResponse {
  status: string
  results: StockData[]
  count?: number
}

function transformPolygonData(ticker: PolygonTickerData): StockData | null {
  // Get current price from day data (most reliable)
  const currentPrice = ticker.day?.c || ticker.min?.c || 0
  const previousClose = ticker.prevDay?.c || 0
  
  // Use Polygon's pre-calculated change values when available
  let change = ticker.todaysChange || 0
  let changePercent = ticker.todaysChangePerc || 0
  
  // If Polygon's calculated values are not available, calculate manually
  if (change === 0 && changePercent === 0 && previousClose > 0) {
    change = currentPrice - previousClose
    changePercent = (change / previousClose) * 100
  }
  
  // Data validation
  if (currentPrice <= 0) {
    return null // Skip stocks with zero or negative prices
  }
  
  // Filter out penny stocks below $1.00 for better quality data
  if (currentPrice < 1.00) {
    return null
  }
  
  // Filter out unrealistic percentage changes (>500%)
  if (Math.abs(changePercent) > 500) {
    return null
  }
  
  // Filter out stocks with no volume
  const volume = ticker.day?.v || ticker.min?.v || 0
  if (volume <= 0) {
    return null
  }
  
  // Estimate market cap based on price and volume
  const estimatedShares = Math.max(volume * 10, 1000000) // Rough estimate
  const marketCap = currentPrice * estimatedShares

  return {
    ticker: ticker.ticker,
    name: ticker.ticker, // Polygon doesn't provide company name in this endpoint
    value: currentPrice,
    change,
    change_percent: changePercent,
    market_cap: marketCap,
  }
}

async function makePolygonRequest(endpoint: string): Promise<any> {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon API key is not configured')
  }

  const url = `https://api.polygon.io${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${POLYGON_API_KEY}`
  
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

// Enhanced function to get the most recent trading data for a stock
async function getMostRecentStockData(stock: string): Promise<PolygonTickerData | null> {
  try {
    // Strategy 1: Try to get the most recent daily data (last 5 trading days)
    const today = new Date()
    let foundData: any = null
    let foundDate: string | null = null
    let prevDate: string | null = null
    
    // Try the last 5 trading days to find the most recent data
    for (let i = 0; i < 5; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      try {
        const endpoint = `/v2/aggs/ticker/${stock}/range/1/day/${dateStr}/${dateStr}`
        const data = await makePolygonRequest(endpoint)
        
        if (data.results && data.results.length > 0) {
          foundData = data.results[0]
          foundDate = dateStr
          break
        }
      } catch (error) {
        console.log(`No data for ${stock} on ${dateStr}`)
        continue
      }
    }
    
    if (!foundData || !foundDate) {
      console.log(`No recent data found for ${stock} in the last 5 days`)
      return null
    }
    
    // Strategy 2: Get the previous trading day data for comparison
    const prevTradingDay = new Date(foundDate)
    prevTradingDay.setDate(prevTradingDay.getDate() - 1)
    
    // Try to find the previous trading day data
    for (let i = 1; i <= 5; i++) {
      const checkDate = new Date(foundDate)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      try {
        const endpoint = `/v2/aggs/ticker/${stock}/range/1/day/${dateStr}/${dateStr}`
        const data = await makePolygonRequest(endpoint)
        
        if (data.results && data.results.length > 0) {
          prevDate = dateStr
          break
        }
      } catch (error) {
        continue
      }
    }
    
    // Strategy 3: If no previous day found, use the current day's open as previous close
    let previousClose = foundData.o // Use open as fallback
    if (prevDate) {
      try {
        const prevEndpoint = `/v2/aggs/ticker/${stock}/range/1/day/${prevDate}/${prevDate}`
        const prevData = await makePolygonRequest(prevEndpoint)
        if (prevData.results && prevData.results.length > 0) {
          previousClose = prevData.results[0].c
        }
      } catch (error) {
        console.log(`Could not fetch previous day data for ${stock}`)
      }
    }
    
    // Calculate change from previous close
    const currentPrice = foundData.c
    const change = currentPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
    
    const tickerData: PolygonTickerData = {
      ticker: stock,
      day: {
        c: currentPrice,
        h: foundData.h,
        l: foundData.l,
        o: foundData.o,
        v: foundData.v,
        vw: foundData.vw
      },
      prevDay: {
        c: previousClose,
        h: foundData.h,
        l: foundData.l,
        o: foundData.o,
        v: foundData.v,
        vw: foundData.vw
      },
      todaysChange: change,
      todaysChangePerc: changePercent,
      updated: foundData.t
    }
    
    return tickerData
  } catch (error) {
    console.log(`Failed to fetch data for ${stock}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'gainers' // Default to gainers

    if (!POLYGON_API_KEY) {
      console.error('Polygon API key is not configured')
      return NextResponse.json(
        { error: 'Polygon API key is not configured', status: 'ERROR', results: [], count: 0 },
        { status: 500 }
      )
    }

    // Validate type parameter
    if (type !== 'gainers' && type !== 'losers') {
      console.error(`Invalid type parameter: ${type}`)
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "gainers" or "losers"', status: 'ERROR', results: [], count: 0 },
        { status: 400 }
      )
    }

    // Enhanced list of major stocks with better coverage
    const majorStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'CRM', 'ADBE', 'PYPL', 'UBER', 'SHOP', 'ZM', 'SQ', 'ROKU', 'SNAP', 'TWTR',
      'JPM', 'JNJ', 'PG', 'UNH', 'HD', 'MA', 'V', 'DIS', 'BAC', 'KO', 'PFE', 'TMO',
      'ABT', 'PEP', 'AVGO', 'COST', 'MRK', 'WMT', 'ACN', 'DHR', 'LLY', 'NEE'
    ]
    
    console.log(`🔍 Fetching data for ${majorStocks.length} major stocks...`)
    
    let allTickers: PolygonTickerData[] = []
    
    // Fetch data for major stocks with enhanced error handling
    for (const stock of majorStocks) {
      try {
        const tickerData = await getMostRecentStockData(stock)
        if (tickerData) {
          allTickers.push(tickerData)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.log(`Failed to fetch data for ${stock}:`, error)
        continue
      }
    }
    
    if (allTickers.length === 0) {
      console.warn('No ticker data available from Polygon API')
      return NextResponse.json({
        status: 'OK',
        results: [],
        count: 0,
        message: 'No market data available. This could be due to market hours, API limits, or temporary data unavailability.'
      })
    }
    
    console.log(`✅ Successfully fetched data for ${allTickers.length} stocks`)
    
    // Transform and filter the data
    const transformedResults = allTickers
      .map(ticker => transformPolygonData(ticker))
      .filter((stock): stock is StockData => stock !== null)
    
    if (transformedResults.length === 0) {
      console.warn('No valid stock data after transformation')
      return NextResponse.json({
        status: 'OK',
        results: [],
        count: 0,
        message: 'Data transformation failed. Please try again later.'
      })
    }
    
    // Sort by percentage change (gainers: descending, losers: ascending)
    const sortedResults = transformedResults.sort((a, b) => {
      if (type === 'gainers') {
        return b.change_percent - a.change_percent
      } else {
        return a.change_percent - b.change_percent
      }
    })
    
    // Take top 20 after sorting
    const finalResults = sortedResults.slice(0, 20)
    
    console.log(`✅ Successfully processed ${finalResults.length} ${type} from ${allTickers.length} raw tickers`)
    
    // Log sample data for verification
    if (finalResults.length > 0) {
      console.log(`📊 Sample ${type} data:`, finalResults.slice(0, 3).map(stock => ({
        ticker: stock.ticker,
        price: stock.value.toFixed(2),
        change: stock.change.toFixed(2),
        changePercent: stock.change_percent.toFixed(2) + '%'
      })))
    }
    
    const response: ApiResponse = {
      status: 'OK',
      results: finalResults,
      count: finalResults.length
    }

    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Error fetching top movers:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    // Return structured error response
    return NextResponse.json({
      status: 'ERROR',
      results: [],
      count: 0,
      error: errorMessage
    }, { status: 500 })
  }
}

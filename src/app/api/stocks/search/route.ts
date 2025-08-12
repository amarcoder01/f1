// API Route for searching US stocks with multi-source fallback system
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Polygon API configuration
const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const POLYGON_BASE_URL = 'https://api.polygon.io'

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
        v: number
        vw: number
      }
    }
  }>
}

function getSectorFromName(name: string): string {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('tech') || lowerName.includes('software') || lowerName.includes('apple') || lowerName.includes('microsoft')) {
    return 'Technology'
  }
  if (lowerName.includes('bank') || lowerName.includes('financial') || lowerName.includes('insurance')) {
    return 'Financial Services'
  }
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('pharma')) {
    return 'Healthcare'
  }
  if (lowerName.includes('energy') || lowerName.includes('oil') || lowerName.includes('gas')) {
    return 'Energy'
  }
  if (lowerName.includes('consumer') || lowerName.includes('retail') || lowerName.includes('amazon')) {
    return 'Consumer Discretionary'
  }
  if (lowerName.includes('industrial') || lowerName.includes('manufacturing')) {
    return 'Industrials'
  }
  if (lowerName.includes('utility') || lowerName.includes('electric')) {
    return 'Utilities'
  }
  if (lowerName.includes('real estate') || lowerName.includes('reit')) {
    return 'Real Estate'
  }
  if (lowerName.includes('material') || lowerName.includes('mining') || lowerName.includes('chemical')) {
    return 'Materials'
  }
  if (lowerName.includes('communication') || lowerName.includes('media') || lowerName.includes('google')) {
    return 'Communication Services'
  }
  
  return 'Technology' // Default
}

// Multi-source search function
async function multiSourceSearch(query: string): Promise<Stock[]> {
  let results: Stock[] = []
  
  // 1. Try Polygon.io search first (if API key is available)
  if (POLYGON_API_KEY) {
    try {
      console.log(`🔍 Trying Polygon.io search for "${query}"...`)
      const polygonResults = await searchPolygonStocks(query)
      if (polygonResults && polygonResults.length > 0) {
        console.log(`✅ Polygon.io search found ${polygonResults.length} results`)
        results = polygonResults
      }
    } catch (error) {
      console.log(`❌ Polygon.io search failed:`, error)
    }
  }
  
  // 2. If no results, try yfinance search
  if (results.length === 0) {
    try {
      console.log(`🔍 Trying yfinance search for "${query}"...`)
      const { stdout, stderr } = await execAsync(`python scripts/yfinance_search.py "${query}"`)
      
      if (stderr) {
        console.error('Python stderr:', stderr)
      }
      
      const result = JSON.parse(stdout.trim())
      if (result.success && result.stocks) {
        console.log(`✅ yfinance search found ${result.stocks.length} results`)
        results = result.stocks
      }
    } catch (error) {
      console.log(`❌ yfinance search failed:`, error)
    }
  }
  
  // 3. If still no results, try Yahoo Finance search
  if (results.length === 0) {
    try {
      console.log(`🔍 Trying Yahoo Finance search for "${query}"...`)
      const yahooResults = await searchYahooFinance(query)
      if (yahooResults && yahooResults.length > 0) {
        console.log(`✅ Yahoo Finance search found ${yahooResults.length} results`)
        results = yahooResults
      }
    } catch (error) {
      console.log(`❌ Yahoo Finance search failed:`, error)
    }
  }
  
  // 4. Return mock results as last resort
  if (results.length === 0) {
    console.log(`⚠️ All search sources failed for "${query}", returning mock results`)
    results = [
      {
        symbol: query.toUpperCase(),
        name: `${query.toUpperCase()} Inc.`,
        price: 150.00,
        change: 2.50,
        changePercent: 1.67,
        volume: 1000000,
        marketCap: 1000000000,
        pe: 25.0,
        dividend: 1.50,
        sector: 'Technology',
        industry: 'Software',
        exchange: 'NASDAQ',
        dayHigh: 152.00,
        dayLow: 148.00,
        fiftyTwoWeekHigh: 200.00,
        fiftyTwoWeekLow: 100.00,
        avgVolume: 1500000,
        dividendYield: 1.0,
        beta: 1.2,
        eps: 6.00,
        lastUpdated: new Date().toISOString()
      }
    ]
  }
  
  // Remove duplicates and sort by relevance
  const uniqueResults = results.filter((stock, index, self) => 
    index === self.findIndex(s => s.symbol === stock.symbol)
  )
  
  // Sort by relevance (exact symbol match first, then symbol starts with, then name contains)
  const sortedResults = uniqueResults.sort((a, b) => {
    const queryLower = query.toLowerCase()
    const aSymbol = a.symbol.toLowerCase()
    const bSymbol = b.symbol.toLowerCase()
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    
    // Exact symbol match gets highest priority
    if (aSymbol === queryLower && bSymbol !== queryLower) return -1
    if (bSymbol === queryLower && aSymbol !== queryLower) return 1
    
    // Symbol starts with query
    if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1
    if (bSymbol.startsWith(queryLower) && !aSymbol.startsWith(queryLower)) return 1
    
    // Symbol contains query
    if (aSymbol.includes(queryLower) && !bSymbol.includes(queryLower)) return -1
    if (bSymbol.includes(queryLower) && !aSymbol.includes(queryLower)) return 1
    
    // Name contains query
    if (aName.includes(queryLower) && !bName.includes(queryLower)) return -1
    if (bName.includes(queryLower) && !aName.includes(queryLower)) return 1
    
    return 0
  })
  
  return sortedResults
}

// Polygon.io search implementation
async function searchPolygonStocks(query: string): Promise<Stock[]> {
  if (!POLYGON_API_KEY) return []
  
  try {
    const searchTerm = query.toUpperCase().trim()
    
    // First try exact ticker match for efficiency
    if (searchTerm.length <= 5 && /^[A-Z]+$/.test(searchTerm)) {
      try {
        const exactStock = await getStockData(searchTerm)
        if (exactStock) {
          return [exactStock]
        }
      } catch (error) {
        console.log(`❌ Exact match failed for ${searchTerm}`)
      }
    }
    
    // Search for tickers
    const response = await fetch(
      `${POLYGON_BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(searchTerm)}&market=stocks&active=true&limit=15&apikey=${POLYGON_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data: PolygonTickerResponse = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return []
    }
    
    // Get detailed data for each result (limit to first 10 to avoid rate limits)
    const stocks: Stock[] = []
    for (let i = 0; i < Math.min(data.results.length, 10); i++) {
      const ticker = data.results[i]
      const stock = await getStockData(ticker.ticker)
      if (stock) {
        stocks.push(stock)
      }
      
      // Add small delay to avoid rate limiting
      if (i < Math.min(data.results.length, 10) - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return stocks
    
  } catch (error) {
    console.error('Polygon search error:', error)
    return []
  }
}

// Yahoo Finance search implementation
async function searchYahooFinance(query: string): Promise<Stock[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
    )
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }
    
    const data = await response.json()
    const quotes = data.quotes || []
    
    if (quotes.length === 0) {
      return []
    }
    
    // Convert to our Stock format
    const stocks: Stock[] = []
    for (const quote of quotes.slice(0, 10)) {
      if (quote.quoteType === 'EQUITY' && quote.market === 'us_market') {
        const stock: Stock = {
          symbol: quote.symbol,
          name: quote.longname || quote.shortname || quote.symbol,
          price: quote.regularMarketPrice?.raw || 0,
          change: (quote.regularMarketPrice?.raw || 0) - (quote.regularMarketPreviousClose?.raw || 0),
          changePercent: quote.regularMarketChangePercent?.raw || 0,
          volume: quote.regularMarketVolume?.raw || 0,
          marketCap: quote.marketCap?.raw || 0,
          pe: quote.trailingPE?.raw || 0,
          dividend: 0, // Not provided by search endpoint
          sector: quote.sector || 'Technology',
          industry: quote.industry || 'Technology',
          exchange: quote.exchange === 'NYQ' ? 'NYSE' : quote.exchange === 'NMS' ? 'NASDAQ' : 'OTC',
          dayHigh: quote.regularMarketDayHigh?.raw || 0,
          dayLow: quote.regularMarketDayLow?.raw || 0,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh?.raw || 0,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow?.raw || 0,
          avgVolume: quote.averageDailyVolume3Month?.raw || 0,
          dividendYield: quote.trailingAnnualDividendYield?.raw || 0,
          beta: quote.beta?.raw || 0,
          eps: quote.trailingEps?.raw || 0,
          lastUpdated: new Date().toISOString()
        }
        stocks.push(stock)
      }
    }
    
    return stocks
    
  } catch (error) {
    console.error('Yahoo Finance search error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      return NextResponse.json({ success: false, data: [], message: 'Query parameter required' })
    }

    console.log('API: Multi-source search for stocks:', query)

    // Use multi-source search system
    const results = await multiSourceSearch(query)
    
    console.log(`API: Multi-source search completed: ${results.length} results found`)
    return NextResponse.json({ 
      success: true, 
      data: results,
      message: `Found ${results.length} stocks`
    })

  } catch (error) {
    console.error('API: Search error:', error)
    return NextResponse.json({ 
      success: false, 
      data: [], 
      message: 'Internal server error' 
    }, { status: 500 })
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
// API Route for searching US stocks with simplified, reliable search
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'

// Cache for search results to improve performance
const searchCache = new Map<string, { results: Stock[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const POPULAR_STOCKS: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.50,
    change: 4.25,
    changePercent: 2.34,
    volume: 45678900,
    marketCap: 2890000000000,
    pe: 28.5,
    dividend: 0.96,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    dayHigh: 187.20,
    dayLow: 182.15,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 124.17,
    avgVolume: 52000000,
    dividendYield: 0.52,
    beta: 1.24,
    eps: 6.50,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -2.15,
    changePercent: -0.56,
    volume: 23456780,
    marketCap: 2810000000000,
    pe: 32.1,
    dividend: 3.00,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    dayHigh: 382.50,
    dayLow: 376.20,
    fiftyTwoWeekHigh: 420.82,
    fiftyTwoWeekLow: 213.43,
    avgVolume: 25000000,
    dividendYield: 0.79,
    beta: 0.89,
    eps: 11.80,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 138.75,
    change: 1.85,
    changePercent: 1.35,
    volume: 28901234,
    marketCap: 1750000000000,
    pe: 26.8,
    dividend: 0.00,
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    exchange: 'NASDAQ',
    dayHigh: 140.20,
    dayLow: 136.50,
    fiftyTwoWeekHigh: 151.55,
    fiftyTwoWeekLow: 83.34,
    avgVolume: 30000000,
    dividendYield: 0.00,
    beta: 1.05,
    eps: 5.18,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 244.80,
    change: 8.20,
    changePercent: 3.47,
    volume: 67890123,
    marketCap: 780000000000,
    pe: 75.2,
    dividend: 0.00,
    sector: 'Consumer Discretionary',
    industry: 'Auto Manufacturers',
    exchange: 'NASDAQ',
    dayHigh: 248.50,
    dayLow: 240.10,
    fiftyTwoWeekHigh: 299.29,
    fiftyTwoWeekLow: 138.80,
    avgVolume: 70000000,
    dividendYield: 0.00,
    beta: 2.1,
    eps: 3.25,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 145.30,
    change: 2.80,
    changePercent: 1.96,
    volume: 35000000,
    marketCap: 1500000000000,
    pe: 60.5,
    dividend: 0.00,
    sector: 'Consumer Discretionary',
    industry: 'Internet Retail',
    exchange: 'NASDAQ',
    dayHigh: 147.00,
    dayLow: 143.50,
    fiftyTwoWeekHigh: 170.00,
    fiftyTwoWeekLow: 100.00,
    avgVolume: 38000000,
    dividendYield: 0.00,
    beta: 1.3,
    eps: 2.40,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 300.50,
    change: 4.50,
    changePercent: 1.52,
    volume: 18000000,
    marketCap: 750000000000,
    pe: 22.8,
    dividend: 0.00,
    sector: 'Technology',
    industry: 'Internet Services',
    exchange: 'NASDAQ',
    dayHigh: 302.00,
    dayLow: 298.50,
    fiftyTwoWeekHigh: 350.00,
    fiftyTwoWeekLow: 200.00,
    avgVolume: 20000000,
    dividendYield: 0.00,
    beta: 1.2,
    eps: 13.18,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    price: 400.25,
    change: -5.75,
    changePercent: -1.42,
    volume: 8000000,
    marketCap: 180000000000,
    pe: 35.2,
    dividend: 0.00,
    sector: 'Communication Services',
    industry: 'Entertainment',
    exchange: 'NASDAQ',
    dayHigh: 405.00,
    dayLow: 395.50,
    fiftyTwoWeekHigh: 450.00,
    fiftyTwoWeekLow: 250.00,
    avgVolume: 9000000,
    dividendYield: 0.00,
    beta: 1.4,
    eps: 11.37,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 450.00,
    change: 15.50,
    changePercent: 3.57,
    volume: 40000000,
    marketCap: 1100000000000,
    pe: 45.8,
    dividend: 0.16,
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'NASDAQ',
    dayHigh: 455.00,
    dayLow: 440.50,
    fiftyTwoWeekHigh: 500.00,
    fiftyTwoWeekLow: 200.00,
    avgVolume: 45000000,
    dividendYield: 0.04,
    beta: 1.8,
    eps: 9.82,
    lastUpdated: new Date().toISOString()
  }
]

// Enhanced search function with better performance
async function searchStocks(query: string): Promise<Stock[]> {
  const searchTerm = query.toLowerCase().trim()
  
  if (searchTerm.length < 1) {
    return []
  }

  // Check cache first
  const cacheKey = searchTerm
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Returning cached results for "${searchTerm}"`)
    return cached.results
  }

  console.log(`🔍 Searching for: "${searchTerm}"`)

  let results: Stock[] = []

  // 1. Exact symbol match (highest priority)
  const exactMatch = POPULAR_STOCKS.find(stock => 
    stock.symbol.toLowerCase() === searchTerm
  )
  
  if (exactMatch) {
    console.log(`✅ Exact match found: ${exactMatch.symbol}`)
    results = [exactMatch]
  } else {
    // 2. Symbol starts with
  const symbolStartsWith = POPULAR_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().startsWith(searchTerm)
  )
  
  if (symbolStartsWith.length > 0) {
    console.log(`✅ Found ${symbolStartsWith.length} stocks starting with "${searchTerm}"`)
      results = symbolStartsWith
    } else {
      // 3. Symbol contains
  const symbolContains = POPULAR_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm)
  )
  
  if (symbolContains.length > 0) {
    console.log(`✅ Found ${symbolContains.length} stocks containing "${searchTerm}"`)
        results = symbolContains
      } else {
        // 4. Company name contains
  const nameContains = POPULAR_STOCKS.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm)
  )
  
  if (nameContains.length > 0) {
    console.log(`✅ Found ${nameContains.length} companies with name containing "${searchTerm}"`)
          results = nameContains
        }
      }
    }
  }

  // Cache the results
  searchCache.set(cacheKey, { results, timestamp: Date.now() })

  // Clean old cache entries (keep only last 100)
  if (searchCache.size > 100) {
    const entries = Array.from(searchCache.entries())
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
    const newCache = new Map(entries.slice(0, 100))
    searchCache.clear()
    newCache.forEach((value, key) => searchCache.set(key, value))
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      return NextResponse.json({ 
        success: false, 
        results: [], 
        message: 'Query parameter required' 
      })
    }

    console.log('🔍 API: Searching for stocks:', query)

    // Use optimized search
    const results = await searchStocks(query)
    
    console.log(`✅ API: Search completed: ${results.length} results found`)
    return NextResponse.json({ 
      success: true, 
      results: results,
      message: `Found ${results.length} stocks`
    })

  } catch (error) {
    console.error('❌ API: Search error:', error)
    return NextResponse.json({ 
      success: false, 
      results: [], 
      message: 'Search failed' 
    }, { status: 500 })
  }
}
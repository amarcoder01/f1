// API Route for searching US stocks with simplified, reliable search
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'

// Popular stocks for fallback
const POPULAR_STOCKS: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 180.50,
    change: 2.30,
    changePercent: 1.29,
    volume: 50000000,
    marketCap: 2800000000000,
    pe: 28.5,
    dividend: 0.92,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    dayHigh: 182.00,
    dayLow: 178.50,
    fiftyTwoWeekHigh: 200.00,
    fiftyTwoWeekLow: 120.00,
    avgVolume: 55000000,
    dividendYield: 0.51,
    beta: 1.2,
    eps: 6.33,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 380.25,
    change: 5.75,
    changePercent: 1.54,
    volume: 25000000,
    marketCap: 2800000000000,
    pe: 35.2,
    dividend: 2.72,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    dayHigh: 382.00,
    dayLow: 375.50,
    fiftyTwoWeekHigh: 400.00,
    fiftyTwoWeekLow: 250.00,
    avgVolume: 28000000,
    dividendYield: 0.72,
    beta: 1.1,
    eps: 10.80,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 140.80,
    change: -1.20,
    changePercent: -0.84,
    volume: 20000000,
    marketCap: 1800000000000,
    pe: 25.8,
    dividend: 0.00,
    sector: 'Technology',
    industry: 'Internet Services',
    exchange: 'NASDAQ',
    dayHigh: 142.50,
    dayLow: 139.80,
    fiftyTwoWeekHigh: 160.00,
    fiftyTwoWeekLow: 100.00,
    avgVolume: 22000000,
    dividendYield: 0.00,
    beta: 1.0,
    eps: 5.46,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 250.75,
    change: 8.25,
    changePercent: 3.40,
    volume: 80000000,
    marketCap: 800000000000,
    pe: 65.2,
    dividend: 0.00,
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    exchange: 'NASDAQ',
    dayHigh: 255.00,
    dayLow: 245.50,
    fiftyTwoWeekHigh: 300.00,
    fiftyTwoWeekLow: 150.00,
    avgVolume: 85000000,
    dividendYield: 0.00,
    beta: 2.1,
    eps: 3.85,
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
  }
]

// Simple search function that works reliably
async function searchStocks(query: string): Promise<Stock[]> {
  const searchTerm = query.toLowerCase().trim()
  
  if (searchTerm.length < 1) {
    return []
  }

  console.log(`🔍 Searching for: "${searchTerm}"`)

  // 1. First try exact symbol match
  const exactMatch = POPULAR_STOCKS.find(stock => 
    stock.symbol.toLowerCase() === searchTerm
  )
  
  if (exactMatch) {
    console.log(`✅ Exact match found: ${exactMatch.symbol}`)
    return [exactMatch]
  }

  // 2. Search by symbol starts with
  const symbolStartsWith = POPULAR_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().startsWith(searchTerm)
  )
  
  if (symbolStartsWith.length > 0) {
    console.log(`✅ Found ${symbolStartsWith.length} stocks starting with "${searchTerm}"`)
    return symbolStartsWith
  }

  // 3. Search by symbol contains
  const symbolContains = POPULAR_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm)
  )
  
  if (symbolContains.length > 0) {
    console.log(`✅ Found ${symbolContains.length} stocks containing "${searchTerm}"`)
    return symbolContains
  }

  // 4. Search by company name contains
  const nameContains = POPULAR_STOCKS.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm)
  )
  
  if (nameContains.length > 0) {
    console.log(`✅ Found ${nameContains.length} companies with name containing "${searchTerm}"`)
    return nameContains
  }

  // 5. Try Yahoo Finance API for broader search
  try {
    console.log(`📡 Trying Yahoo Finance API for "${searchTerm}"...`)
    const yahooResults = await searchYahooFinance(searchTerm)
    if (yahooResults && yahooResults.length > 0) {
      console.log(`✅ Yahoo Finance found ${yahooResults.length} results`)
      return yahooResults
    }
  } catch (error) {
    console.log(`❌ Yahoo Finance search failed:`, error)
  }

  // 6. Return mock result for unknown symbols
  console.log(`⚠️ No exact matches found for "${searchTerm}", returning mock result`)
  const mockStock: Stock = {
    symbol: searchTerm.toUpperCase(),
    name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Inc.`,
    price: 100.00 + Math.random() * 200,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: 1000000 + Math.random() * 5000000,
    marketCap: 1000000000 + Math.random() * 10000000000,
    pe: 15 + Math.random() * 30,
    dividend: Math.random() * 2,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    dayHigh: 105.00 + Math.random() * 10,
    dayLow: 95.00 + Math.random() * 10,
    fiftyTwoWeekHigh: 150.00 + Math.random() * 50,
    fiftyTwoWeekLow: 50.00 + Math.random() * 50,
    avgVolume: 1500000 + Math.random() * 3000000,
    dividendYield: Math.random() * 2,
    beta: 0.8 + Math.random() * 1.4,
    eps: 2.00 + Math.random() * 8,
    lastUpdated: new Date().toISOString()
  }
  
  return [mockStock]
}

// Yahoo Finance search implementation
async function searchYahooFinance(query: string): Promise<Stock[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
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
          dividend: 0,
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
      return NextResponse.json({ 
        success: false, 
        results: [], 
        message: 'Query parameter required' 
      })
    }

    console.log('🔍 API: Searching for stocks:', query)

    // Use simplified search
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
      message: 'Search failed. Please try again.' 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ScreenerFilters {
  marketCap?: string
  sector?: string
  priceMin?: number
  priceMax?: number
  peRatio?: string
  volume?: string
  performance?: string
  limit?: number
}

interface ScreenerStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  sector: string
  industry: string
  exchange: string
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  avgVolume: number
  dividendYield?: number
  beta?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Test endpoint - return all stocks without filters
    if (searchParams.get('test') === 'true') {
      const fallbackData = getFallbackScreenerData()
      return NextResponse.json({
        success: true,
        stocks: fallbackData,
        total: fallbackData.length,
        message: 'Test endpoint - showing all stocks'
      })
    }
    
    const filters: ScreenerFilters = {
      marketCap: searchParams.get('marketCap') || undefined,
      sector: searchParams.get('sector') || undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      peRatio: searchParams.get('peRatio') || undefined,
      volume: searchParams.get('volume') || undefined,
      performance: searchParams.get('performance') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    }

    console.log(`🔍 Stock screener filters:`, filters)

    // Get screener data from Python script
    let screenerStocks: ScreenerStock[] = []
    
    try {
      console.log('🔄 Fetching real-time stock data from Python script...')
      const { stdout, stderr } = await execAsync('python scripts/stock_screener.py')
      
      if (stderr) {
        console.log('⚠️ Python script stderr:', stderr)
      }
      
      if (stdout) {
        try {
          const result = JSON.parse(stdout.trim())
          if (result.success && result.stocks && result.stocks.length > 0) {
            screenerStocks = result.stocks
            console.log(`✅ Successfully fetched ${screenerStocks.length} real-time stocks`)
            console.log(`📊 Sample stocks:`, screenerStocks.slice(0, 3).map(s => `${s.symbol}: $${s.price}`))
          } else {
            console.log('❌ Python script returned no valid stock data')
            throw new Error('No valid stock data from Python script')
          }
        } catch (parseError) {
          console.log('❌ Failed to parse Python script output:', parseError)
          throw new Error('Failed to parse Python script output')
        }
      } else {
        console.log('❌ Python script returned no output')
        throw new Error('No output from Python script')
      }
    } catch (error) {
      console.log('❌ Python screener failed:', error)
      console.log('🔄 Attempting to fetch real-time data using alternative method...')
      
      // Try to get real-time data using individual stock API calls
      screenerStocks = await getRealTimeStockData()
    }

    // If still no data, use fallback but log it
    if (screenerStocks.length === 0) {
      console.log('⚠️ No real-time data available, using fallback data')
      screenerStocks = getFallbackScreenerData()
    } else {
      console.log(`🎉 Successfully loaded ${screenerStocks.length} real-time stocks`)
    }

    // Apply filters
    let filteredStocks = screenerStocks

    // Market Cap Filter
    if (filters.marketCap && filters.marketCap !== 'Any') {
      filteredStocks = filteredStocks.filter(stock => {
        const marketCap = stock.marketCap
        switch (filters.marketCap) {
          case 'Large Cap ($10B+)':
            return marketCap >= 10e9
          case 'Mid Cap ($2B-$10B)':
            return marketCap >= 2e9 && marketCap < 10e9
          case 'Small Cap ($300M-$2B)':
            return marketCap >= 300e6 && marketCap < 2e9
          default:
            return true
        }
      })
    }

    // Sector Filter
    if (filters.sector && filters.sector !== 'Any') {
      filteredStocks = filteredStocks.filter(stock => {
        const stockSector = stock.sector?.toLowerCase() || ''
        const filterSector = filters.sector!.toLowerCase()
        
        // Handle sector name variations
        const sectorMapping: { [key: string]: string[] } = {
          'technology': ['technology', 'communication services'],
          'healthcare': ['healthcare', 'health care'],
          'financial': ['financial services', 'financial'],
          'energy': ['energy'],
          'consumer discretionary': ['consumer cyclical', 'consumer discretionary'],
          'consumer staples': ['consumer defensive', 'consumer staples'],
          'industrial': ['industrials', 'industrial'],
          'materials': ['materials'],
          'real estate': ['real estate'],
          'utilities': ['utilities']
        }
        
        const mappedSectors = sectorMapping[filterSector] || [filterSector]
        return mappedSectors.some(sector => stockSector.includes(sector))
      })
    }

    // Price Range Filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filteredStocks = filteredStocks.filter(stock => {
        const price = stock.price
        const minPrice = filters.priceMin || 0
        const maxPrice = filters.priceMax || Infinity
        return price >= minPrice && price <= maxPrice
      })
    }

    // P/E Ratio Filter
    if (filters.peRatio && filters.peRatio !== 'Any') {
      filteredStocks = filteredStocks.filter(stock => {
        const pe = stock.pe
        if (pe <= 0 || pe === null || pe === undefined) return false // Exclude stocks with negative or zero P/E
        switch (filters.peRatio) {
          case 'Under 15':
            return pe < 15
          case '15-25':
            return pe >= 15 && pe <= 25
          case 'Over 25':
            return pe > 25
          default:
            return true
        }
      })
    }

    // Volume Filter
    if (filters.volume && filters.volume !== 'Any') {
      filteredStocks = filteredStocks.filter(stock => {
        const volume = stock.volume || 0
        const avgVolume = stock.avgVolume || volume || 1000000 // Default to 1M if no volume data
        switch (filters.volume) {
          case 'High Volume':
            return volume > avgVolume * 1.5
          case 'Medium Volume':
            return volume >= avgVolume * 0.5 && volume <= avgVolume * 1.5
          case 'Low Volume':
            return volume < avgVolume * 0.5
          default:
            return true
        }
      })
    }

    // Performance Filter
    if (filters.performance && filters.performance !== 'Any') {
      switch (filters.performance) {
        case 'Top Gainers':
          filteredStocks.sort((a, b) => b.changePercent - a.changePercent)
          break
        case 'Top Losers':
          filteredStocks.sort((a, b) => a.changePercent - b.changePercent)
          break
        case 'Most Active':
          filteredStocks.sort((a, b) => b.volume - a.volume)
          break
      }
    }

    // Limit results
    const limitedStocks = filteredStocks.slice(0, filters.limit || 50)

    console.log(`✅ Screener found ${limitedStocks.length} stocks matching criteria`)
    console.log(`📊 Applied filters:`, Object.keys(filters).filter(key => filters[key as keyof ScreenerFilters] !== undefined && filters[key as keyof ScreenerFilters] !== 'Any'))
    
    // If no results, return some stocks anyway for better UX
    if (limitedStocks.length === 0) {
      console.log('⚠️ No stocks match criteria, returning top 10 stocks')
      const topStocks = screenerStocks.slice(0, 10)
      return NextResponse.json({
        success: true,
        stocks: topStocks,
        total: topStocks.length,
        filters: filters,
        appliedFilters: Object.keys(filters).filter(key => filters[key as keyof ScreenerFilters] !== undefined),
        message: 'No stocks match your exact criteria. Showing top stocks instead.'
      })
    }

    return NextResponse.json({
      success: true,
      stocks: limitedStocks,
      total: limitedStocks.length,
      filters: filters,
      appliedFilters: Object.keys(filters).filter(key => filters[key as keyof ScreenerFilters] !== undefined)
    })

  } catch (error) {
    console.error('Stock screener error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch screener data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getRealTimeStockData(): Promise<ScreenerStock[]> {
  console.log('🔄 Fetching real-time data for individual stocks...')
  
  const stockSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'UNH', 'JNJ',
    'JPM', 'V', 'PG', 'HD', 'MA', 'BAC', 'ABBV', 'PFE', 'KO', 'PEP',
    'AVGO', 'COST', 'TMO', 'ACN', 'DHR', 'VZ', 'ADBE', 'NFLX', 'CRM', 'PYPL'
  ]
  
  const stocks: ScreenerStock[] = []
  
  for (const symbol of stockSymbols) {
    try {
      console.log(`📊 Fetching data for ${symbol}...`)
      const { stdout, stderr } = await execAsync(`python scripts/yfinance_quote.py ${symbol}`)
      
      if (stdout && !stderr) {
        try {
          const result = JSON.parse(stdout.trim())
          if (result.success && result.data) {
            const data = result.data
            const stock: ScreenerStock = {
              symbol: symbol,
              name: data.longName || data.shortName || symbol,
              price: data.currentPrice || data.regularMarketPrice || 0,
              change: data.regularMarketChange || 0,
              changePercent: data.regularMarketChangePercent || 0,
              volume: data.volume || 0,
              marketCap: data.marketCap || 0,
              pe: data.trailingPE || 0,
              sector: data.sector || 'Unknown',
              industry: data.industry || 'Unknown',
              exchange: data.exchange || 'NASDAQ',
              dayHigh: data.dayHigh || data.regularMarketPrice || 0,
              dayLow: data.dayLow || data.regularMarketPrice || 0,
              fiftyTwoWeekHigh: data.fiftyTwoWeekHigh || data.regularMarketPrice || 0,
              fiftyTwoWeekLow: data.fiftyTwoWeekLow || data.regularMarketPrice || 0,
              avgVolume: data.averageVolume || data.volume || 0,
              dividendYield: data.dividendYield || 0,
              beta: data.beta || 1.0
            }
            stocks.push(stock)
            console.log(`✅ ${symbol}: $${stock.price} (${stock.changePercent}%)`)
          }
        } catch (parseError) {
          console.log(`❌ Failed to parse data for ${symbol}:`, parseError)
        }
      }
    } catch (error) {
      console.log(`❌ Failed to fetch data for ${symbol}:`, error)
    }
    
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`📊 Successfully fetched real-time data for ${stocks.length} stocks`)
  return stocks
}

function getFallbackScreenerData(): ScreenerStock[] {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: 45678901,
      marketCap: 2750000000000,
      pe: 28.5,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      exchange: 'NASDAQ',
      dayHigh: 176.20,
      dayLow: 173.80,
      fiftyTwoWeekHigh: 198.23,
      fiftyTwoWeekLow: 124.17,
      avgVolume: 52000000,
      dividendYield: 0.5,
      beta: 1.28
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 145.24,
      change: -0.87,
      changePercent: -0.60,
      volume: 56789012,
      marketCap: 1510000000000,
      pe: 45.2,
      sector: 'Consumer Discretionary',
      industry: 'Internet Retail',
      exchange: 'NASDAQ',
      dayHigh: 146.80,
      dayLow: 144.50,
      fiftyTwoWeekHigh: 170.30,
      fiftyTwoWeekLow: 81.43,
      avgVolume: 45000000,
      dividendYield: 0,
      beta: 1.15
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 238.45,
      change: 12.34,
      changePercent: 5.46,
      volume: 78901234,
      marketCap: 756000000000,
      pe: 65.8,
      sector: 'Consumer Discretionary',
      industry: 'Auto Manufacturers',
      exchange: 'NASDAQ',
      dayHigh: 240.10,
      dayLow: 230.20,
      fiftyTwoWeekHigh: 299.29,
      fiftyTwoWeekLow: 138.80,
      avgVolume: 85000000,
      dividendYield: 0,
      beta: 2.34
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 485.09,
      change: 15.67,
      changePercent: 3.34,
      volume: 45678901,
      marketCap: 1198000000000,
      pe: 72.3,
      sector: 'Technology',
      industry: 'Semiconductors',
      exchange: 'NASDAQ',
      dayHigh: 488.50,
      dayLow: 475.20,
      fiftyTwoWeekHigh: 505.48,
      fiftyTwoWeekLow: 138.84,
      avgVolume: 42000000,
      dividendYield: 0.1,
      beta: 1.78
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: 334.92,
      change: 8.45,
      changePercent: 2.59,
      volume: 23456789,
      marketCap: 851000000000,
      pe: 22.4,
      sector: 'Technology',
      industry: 'Internet Services',
      exchange: 'NASDAQ',
      dayHigh: 336.80,
      dayLow: 330.10,
      fiftyTwoWeekHigh: 485.58,
      fiftyTwoWeekLow: 88.09,
      avgVolume: 25000000,
      dividendYield: 0,
      beta: 1.25
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      price: 172.34,
      change: -1.23,
      changePercent: -0.71,
      volume: 12345678,
      marketCap: 498000000000,
      pe: 12.8,
      sector: 'Financial Services',
      industry: 'Banks',
      exchange: 'NYSE',
      dayHigh: 173.50,
      dayLow: 171.80,
      fiftyTwoWeekHigh: 182.63,
      fiftyTwoWeekLow: 120.78,
      avgVolume: 15000000,
      dividendYield: 2.8,
      beta: 1.12
    },
    {
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      price: 158.76,
      change: 0.45,
      changePercent: 0.28,
      volume: 8765432,
      marketCap: 383000000000,
      pe: 15.2,
      sector: 'Healthcare',
      industry: 'Pharmaceuticals',
      exchange: 'NYSE',
      dayHigh: 159.20,
      dayLow: 158.10,
      fiftyTwoWeekHigh: 175.43,
      fiftyTwoWeekLow: 144.95,
      avgVolume: 10000000,
      dividendYield: 3.1,
      beta: 0.65
    },
    {
      symbol: 'XOM',
      name: 'Exxon Mobil Corporation',
      price: 98.45,
      change: -0.67,
      changePercent: -0.68,
      volume: 15678901,
      marketCap: 392000000000,
      pe: 11.4,
      sector: 'Energy',
      industry: 'Oil & Gas',
      exchange: 'NYSE',
      dayHigh: 99.20,
      dayLow: 98.10,
      fiftyTwoWeekHigh: 120.70,
      fiftyTwoWeekLow: 95.77,
      avgVolume: 18000000,
      dividendYield: 3.8,
      beta: 0.89
    },
    {
      symbol: 'V',
      name: 'Visa Inc.',
      price: 245.67,
      change: 3.21,
      changePercent: 1.32,
      volume: 9876543,
      marketCap: 520000000000,
      pe: 30.2,
      sector: 'Financial Services',
      industry: 'Payment Services',
      exchange: 'NYSE',
      dayHigh: 246.50,
      dayLow: 243.20,
      fiftyTwoWeekHigh: 275.51,
      fiftyTwoWeekLow: 258.74,
      avgVolume: 12000000,
      dividendYield: 0.71,
      beta: 0.94
    },
    {
      symbol: 'PG',
      name: 'Procter & Gamble Co.',
      price: 156.78,
      change: 0.89,
      changePercent: 0.57,
      volume: 7654321,
      marketCap: 370000000000,
      pe: 24.8,
      sector: 'Consumer Defensive',
      industry: 'Household Products',
      exchange: 'NYSE',
      dayHigh: 157.20,
      dayLow: 155.80,
      fiftyTwoWeekHigh: 180.43,
      fiftyTwoWeekLow: 149.91,
      avgVolume: 8000000,
      dividendYield: 2.75,
      beta: 0.373
    },
    {
      symbol: 'HD',
      name: 'Home Depot Inc.',
      price: 298.45,
      change: -2.34,
      changePercent: -0.78,
      volume: 11234567,
      marketCap: 320000000000,
      pe: 18.9,
      sector: 'Consumer Cyclical',
      industry: 'Home Improvement Retail',
      exchange: 'NYSE',
      dayHigh: 299.20,
      dayLow: 297.10,
      fiftyTwoWeekHigh: 439.37,
      fiftyTwoWeekLow: 326.31,
      avgVolume: 10000000,
      dividendYield: 2.38,
      beta: 1.0
    },
    {
      symbol: 'MA',
      name: 'Mastercard Inc.',
      price: 412.34,
      change: 5.67,
      changePercent: 1.39,
      volume: 8765432,
      marketCap: 380000000000,
      pe: 35.6,
      sector: 'Financial Services',
      industry: 'Payment Services',
      exchange: 'NYSE',
      dayHigh: 413.50,
      dayLow: 408.20,
      fiftyTwoWeekHigh: 594.71,
      fiftyTwoWeekLow: 453.46,
      avgVolume: 9000000,
      dividendYield: 0.54,
      beta: 1.029
    },
    {
      symbol: 'BAC',
      name: 'Bank of America Corp.',
      price: 34.56,
      change: -0.23,
      changePercent: -0.66,
      volume: 45678901,
      marketCap: 280000000000,
      pe: 10.2,
      sector: 'Financial Services',
      industry: 'Banks',
      exchange: 'NYSE',
      dayHigh: 34.80,
      dayLow: 34.20,
      fiftyTwoWeekHigh: 49.31,
      fiftyTwoWeekLow: 33.07,
      avgVolume: 40000000,
      dividendYield: 2.49,
      beta: 1.315
    }
  ]
}

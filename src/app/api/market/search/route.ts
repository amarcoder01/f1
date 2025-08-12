import { NextRequest, NextResponse } from 'next/server'
import { yahooFinanceSimple } from '@/lib/yahoo-finance-simple'

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
  sector?: string
  industry?: string
  marketCap?: number
  price?: number
  change?: number
  changePercent?: number
  volume?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ 
        error: 'Query parameter is required',
        example: '/api/market/search?q=AAPL&limit=10'
      }, { status: 400 })
    }

    console.log(`🔍 Searching for stocks matching: "${query}"`)

    // Enhanced search with multiple data sources
    const searchResults: SearchResult[] = []

    // 1. Direct symbol match (exact)
    if (query.length <= 5) {
      try {
        const stockData = await yahooFinanceSimple.getStockData(query.toUpperCase())
        if (stockData) {
          searchResults.push({
            symbol: stockData.symbol,
            name: stockData.name,
            exchange: stockData.exchange,
            type: 'stock',
            sector: stockData.sector,
            industry: stockData.industry,
            marketCap: stockData.marketCap,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            volume: stockData.volume
          })
        }
      } catch (error) {
        console.log(`Direct symbol search failed for ${query}:`, error)
      }
    }

    // 2. Popular stocks that match the query
    const popularStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare' },
      { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', sector: 'Consumer Defensive' },
      { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE', sector: 'Healthcare' },
      { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Cyclical' },
      { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', sector: 'Financial Services' },
      { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', sector: 'Healthcare' },
      { symbol: 'KO', name: 'Coca-Cola Co.', exchange: 'NYSE', sector: 'Consumer Defensive' },
      { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Defensive' },
      { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE', sector: 'Healthcare' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'COST', name: 'Costco Wholesale Corp.', exchange: 'NASDAQ', sector: 'Consumer Defensive' }
    ]

    // Filter popular stocks that match the query
    const matchingPopularStocks = popularStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.sector.toLowerCase().includes(query.toLowerCase())
    )

    // Add matching popular stocks to results
    for (const stock of matchingPopularStocks.slice(0, limit)) {
      try {
        const stockData = await yahooFinanceSimple.getStockData(stock.symbol)
        if (stockData) {
          searchResults.push({
            symbol: stockData.symbol,
            name: stockData.name,
            exchange: stockData.exchange,
            type: 'stock',
            sector: stockData.sector,
            industry: stockData.industry,
            marketCap: stockData.marketCap,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            volume: stockData.volume
          })
        }
      } catch (error) {
        console.log(`Failed to get data for ${stock.symbol}:`, error)
        // Add basic info if detailed data fails
        searchResults.push({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          type: 'stock',
          sector: stock.sector
        })
      }
    }

    // 3. Sector-based suggestions
    const sectors = [
      { name: 'Technology', symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AVGO'] },
      { name: 'Healthcare', symbols: ['JNJ', 'UNH', 'PFE', 'ABBV'] },
      { name: 'Financial', symbols: ['JPM', 'BAC', 'WFC', 'GS'] },
      { name: 'Consumer', symbols: ['AMZN', 'HD', 'COST', 'MCD'] },
      { name: 'Energy', symbols: ['XOM', 'CVX', 'COP', 'EOG'] },
      { name: 'Industrial', symbols: ['CAT', 'BA', 'MMM', 'GE'] }
    ]

    // If query matches a sector, add top stocks from that sector
    const matchingSector = sectors.find(sector => 
      sector.name.toLowerCase().includes(query.toLowerCase())
    )

    if (matchingSector && searchResults.length < limit) {
      for (const symbol of matchingSector.symbols.slice(0, 3)) {
        if (!searchResults.find(result => result.symbol === symbol)) {
          try {
            const stockData = await yahooFinanceSimple.getStockData(symbol)
            if (stockData) {
              searchResults.push({
                symbol: stockData.symbol,
                name: stockData.name,
                exchange: stockData.exchange,
                type: 'stock',
                sector: stockData.sector,
                industry: stockData.industry,
                marketCap: stockData.marketCap,
                price: stockData.price,
                change: stockData.change,
                changePercent: stockData.changePercent,
                volume: stockData.volume
              })
            }
          } catch (error) {
            console.log(`Failed to get sector data for ${symbol}:`, error)
          }
        }
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = searchResults.filter((result, index, self) => 
      index === self.findIndex(r => r.symbol === result.symbol)
    ).slice(0, limit)

    console.log(`✅ Found ${uniqueResults.length} stocks matching "${query}"`)

    return NextResponse.json({
      success: true,
      query: query,
      results: uniqueResults,
      total: uniqueResults.length,
      sources: ['Yahoo Finance', 'Popular Stocks', 'Sector Analysis']
    })

  } catch (error) {
    console.error('Market search error:', error)
    return NextResponse.json({ 
      error: 'Failed to search stocks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

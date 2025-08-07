// yfinance API Service - Reliable Python-based stock data
import { Stock } from '@/types'

export class YFinanceAPI {
  private static cache = new Map<string, { data: Stock; timestamp: number }>()
  private static CACHE_DURATION = 60000 // 1 minute cache

  // Get stock data from yfinance via our API route
  async getStockData(symbol: string): Promise<Stock | null> {
    try {
      // Check cache first
      const cached = YFinanceAPI.cache.get(symbol)
      if (cached && Date.now() - cached.timestamp < YFinanceAPI.CACHE_DURATION) {
        return cached.data
      }

      console.log(`📡 Fetching data for ${symbol} from yfinance...`)

      // Use our yfinance API route
      const response = await fetch(`/api/yfinance/quote?symbol=${encodeURIComponent(symbol)}`)

      if (!response.ok) {
        console.log(`❌ yfinance failed for ${symbol}:`, response.status)
        return null
      }

      const data = await response.json()
      
      if (!data.success || !data.stock) {
        console.log(`❌ No yfinance data for ${symbol}`)
        return null
      }

      const stock = data.stock

      // Cache the result
      YFinanceAPI.cache.set(symbol, { data: stock, timestamp: Date.now() })
      
      console.log(`✅ yfinance data fetched for ${symbol}: $${stock.price} (${stock.changePercent.toFixed(2)}%)`)
      return stock

    } catch (error) {
      console.error(`❌ Error fetching yfinance data for ${symbol}:`, error)
      return null
    }
  }

  // Search stocks using yfinance
  async searchStocks(query: string): Promise<Stock[]> {
    try {
      console.log(`🔍 Searching stocks for "${query}" via yfinance...`)
      
      const response = await fetch(`/api/yfinance/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        console.log(`❌ yfinance search failed:`, response.status)
        return []
      }

      const data = await response.json()
      
      if (!data.success || !data.stocks) {
        console.log(`❌ No yfinance search results for "${query}"`)
        return []
      }

      console.log(`✅ yfinance search found ${data.stocks.length} stocks`)
      return data.stocks

    } catch (error) {
      console.error(`❌ Error searching stocks via yfinance:`, error)
      return []
    }
  }
}

export const yfinanceAPI = new YFinanceAPI()

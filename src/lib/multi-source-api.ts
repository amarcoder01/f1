// Multi-Source Stock Data API - Reliable fallback system
import { Stock } from '@/types'
import { polygonAPI } from './polygon-api'
import { yahooFinanceAPI } from './yahoo-finance-api'
import { yfinanceAPI } from './yfinance-api'

export class MultiSourceAPI {
  private static cache = new Map<string, { data: Stock; timestamp: number }>()
  private static CACHE_DURATION = 60000 // 1 minute cache

  // Get stock data with multiple fallback sources
  async getStockData(symbol: string): Promise<Stock | null> {
    try {
      // Check cache first
      const cached = MultiSourceAPI.cache.get(symbol)
      if (cached && Date.now() - cached.timestamp < MultiSourceAPI.CACHE_DURATION) {
        return cached.data
      }

      console.log(`🔍 Fetching data for ${symbol} using multi-source system...`)

      // Try sources in order of preference
      let stock: Stock | null = null

      // 1. Try Polygon.io first (primary source)
      try {
        console.log(`📡 Trying Polygon.io for ${symbol}...`)
        stock = await polygonAPI.getUSStockData(symbol)
        if (stock && stock.price > 0) {
          console.log(`✅ Polygon.io success for ${symbol}: $${stock.price}`)
          MultiSourceAPI.cache.set(symbol, { data: stock, timestamp: Date.now() })
          return stock
        }
      } catch (error) {
        console.log(`❌ Polygon.io failed for ${symbol}:`, error)
      }

      // 2. Try Yahoo Finance (secondary source)
      try {
        console.log(`📡 Trying Yahoo Finance for ${symbol}...`)
        stock = await yahooFinanceAPI.getStockData(symbol)
        if (stock && stock.price > 0) {
          console.log(`✅ Yahoo Finance success for ${symbol}: $${stock.price}`)
          MultiSourceAPI.cache.set(symbol, { data: stock, timestamp: Date.now() })
          return stock
        }
      } catch (error) {
        console.log(`❌ Yahoo Finance failed for ${symbol}:`, error)
      }

      // 3. Try yfinance (tertiary source)
      try {
        console.log(`📡 Trying yfinance for ${symbol}...`)
        stock = await yfinanceAPI.getStockData(symbol)
        if (stock && stock.price > 0) {
          console.log(`✅ yfinance success for ${symbol}: $${stock.price}`)
          MultiSourceAPI.cache.set(symbol, { data: stock, timestamp: Date.now() })
          return stock
        }
      } catch (error) {
        console.log(`❌ yfinance failed for ${symbol}:`, error)
      }

      console.log(`❌ All sources failed for ${symbol}`)
      return null

    } catch (error) {
      console.error(`❌ Error in multi-source fetch for ${symbol}:`, error)
      return null
    }
  }

  // Search stocks with multiple sources
  async searchStocks(query: string): Promise<Stock[]> {
    try {
      console.log(`🔍 Searching stocks for "${query}" using multi-source system...`)

      let results: Stock[] = []

      // 1. Try Polygon.io search first
      try {
        console.log(`📡 Trying Polygon.io search for "${query}"...`)
        const polygonResults = await polygonAPI.searchUSStocks(query)
        if (polygonResults && polygonResults.length > 0) {
          console.log(`✅ Polygon.io search found ${polygonResults.length} results`)
          results = polygonResults
        }
      } catch (error) {
        console.log(`❌ Polygon.io search failed:`, error)
      }

      // 2. If no results, try Yahoo Finance search
      if (results.length === 0) {
        try {
          console.log(`📡 Trying Yahoo Finance search for "${query}"...`)
          const yahooResults = await yahooFinanceAPI.searchStocks(query)
          if (yahooResults && yahooResults.length > 0) {
            console.log(`✅ Yahoo Finance search found ${yahooResults.length} results`)
            results = yahooResults
          }
        } catch (error) {
          console.log(`❌ Yahoo Finance search failed:`, error)
        }
      }

      // 3. If still no results, try yfinance search
      if (results.length === 0) {
        try {
          console.log(`📡 Trying yfinance search for "${query}"...`)
          const yfinanceResults = await yfinanceAPI.searchStocks(query)
          if (yfinanceResults && yfinanceResults.length > 0) {
            console.log(`✅ yfinance search found ${yfinanceResults.length} results`)
            results = yfinanceResults
          }
        } catch (error) {
          console.log(`❌ yfinance search failed:`, error)
        }
      }

      console.log(`✅ Multi-source search completed. Found ${results.length} stocks`)
      return results

    } catch (error) {
      console.error(`❌ Error in multi-source search:`, error)
      return []
    }
  }

  // Get source status for debugging
  async getSourceStatus(): Promise<{
    polygon: boolean
    yahoo: boolean
    yfinance: boolean
  }> {
    const testSymbol = 'AAPL'
    
    const status = {
      polygon: false,
      yahoo: false,
      yfinance: false
    }

    // Test Polygon.io
    try {
      const polygonResult = await polygonAPI.getUSStockData(testSymbol)
      status.polygon = !!(polygonResult && polygonResult.price > 0)
    } catch (error) {
      status.polygon = false
    }

    // Test Yahoo Finance
    try {
      const yahooResult = await yahooFinanceAPI.getStockData(testSymbol)
      status.yahoo = !!(yahooResult && yahooResult.price > 0)
    } catch (error) {
      status.yahoo = false
    }

    // Test yfinance
    try {
      const yfinanceResult = await yfinanceAPI.getStockData(testSymbol)
      status.yfinance = !!(yfinanceResult && yfinanceResult.price > 0)
    } catch (error) {
      status.yfinance = false
    }

    return status
  }
}

export const multiSourceAPI = new MultiSourceAPI()

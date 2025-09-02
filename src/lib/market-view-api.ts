import { Stock, StockDetails, AppError } from '@/types/market-view'

const API_BASE_URL = '/api/market-view'

export class MarketViewApiService {
  private createAppError(type: AppError['type'], message: string, details?: any): AppError {
    return { type, message, details }
  }

  async getStocks(limit: number = 50, cursor?: string): Promise<{ stocks: Stock[]; nextCursor?: string }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      if (cursor) {
        params.append('cursor', cursor)
      }
      
      const response = await fetch(`${API_BASE_URL}/stocks?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return {
        stocks: data.stocks || [],
        nextCursor: data.nextCursor
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw this.createAppError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.')
      }
      throw this.createAppError('API_ERROR', error instanceof Error ? error.message : 'Failed to fetch stock data')
    }
  }

  async searchStocks(query: string): Promise<Stock[]> {
    try {
      const params = new URLSearchParams({
        search: query,
        limit: '20'
      })
      
      const response = await fetch(`${API_BASE_URL}/stocks?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to search stocks: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return data.stocks || []
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw this.createAppError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.')
      }
      throw this.createAppError('API_ERROR', error instanceof Error ? error.message : 'Failed to search stocks')
    }
  }

  async getStockDetails(ticker: string): Promise<StockDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/details/${ticker}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock details: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw this.createAppError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.')
      }
      throw this.createAppError('API_ERROR', error instanceof Error ? error.message : `Failed to fetch details for ${ticker}`)
    }
  }

  isMarketClosed(): boolean {
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 6 = Saturday
    const hour = now.getHours()
    
    // Weekend
    if (day === 0 || day === 6) {
      return true
    }
    
    // Weekday but outside market hours (9:30 AM - 4:00 PM EST)
    if (hour < 9 || (hour === 9 && now.getMinutes() < 30) || hour >= 16) {
      return true
    }
    
    return false
  }
}

export const marketViewApiService = new MarketViewApiService()

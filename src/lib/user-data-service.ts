import { DatabaseService } from './db'
import { AuthService } from './auth-service'

export class UserDataService {
  // Get current user ID from token
  private static async getCurrentUserId(token?: string): Promise<string> {
    if (token) {
      const user = await AuthService.getUserFromToken(token)
      if (user) {
        return user.id
      }
    }
    
    // Fallback to demo user
    const demoUser = await DatabaseService.getOrCreateDemoUser()
    return demoUser.id
  }

  // ===== RECENT SEARCHES =====
  
  static async getRecentSearches(token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getRecentSearches(userId)
    } catch (error) {
      console.error('Error getting recent searches:', error)
      return []
    }
  }

  static async addRecentSearch(query: string, results: any[], token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.storeRecentSearch(userId, {
        query,
        results,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error adding recent search:', error)
      return []
    }
  }

  // ===== FAVORITE STOCKS =====
  
  static async getFavoriteStocks(token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getFavoriteStocks(userId)
    } catch (error) {
      console.error('Error getting favorite stocks:', error)
      return []
    }
  }

  static async addFavoriteStock(stock: any, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const favorites = await DatabaseService.getFavoriteStocks(userId)
      
      // Check if already exists
      const exists = favorites.find((f: any) => f.symbol === stock.symbol)
      if (!exists) {
        favorites.push(stock)
        return await DatabaseService.storeFavoriteStocks(userId, favorites)
      }
      
      return favorites
    } catch (error) {
      console.error('Error adding favorite stock:', error)
      return []
    }
  }

  static async removeFavoriteStock(symbol: string, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const favorites = await DatabaseService.getFavoriteStocks(userId)
      const filtered = favorites.filter((f: any) => f.symbol !== symbol)
      return await DatabaseService.storeFavoriteStocks(userId, filtered)
    } catch (error) {
      console.error('Error removing favorite stock:', error)
      return []
    }
  }

  // ===== PORTFOLIO DATA =====
  
  static async getPortfolioData(token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getPortfolioData(userId)
    } catch (error) {
      console.error('Error getting portfolio data:', error)
      return { positions: [], transactions: [], trades: [] }
    }
  }

  static async updatePortfolioData(portfolioData: any, token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.storePortfolioData(userId, portfolioData)
    } catch (error) {
      console.error('Error updating portfolio data:', error)
      throw error
    }
  }

  // ===== TRADING STRATEGIES =====
  
  static async getTradingStrategies(token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getTradingStrategies(userId)
    } catch (error) {
      console.error('Error getting trading strategies:', error)
      return []
    }
  }

  static async saveTradingStrategy(strategy: any, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const strategies = await DatabaseService.getTradingStrategies(userId)
      
      // Update existing or add new
      const index = strategies.findIndex((s: any) => s.id === strategy.id)
      if (index >= 0) {
        strategies[index] = strategy
      } else {
        strategies.push({ ...strategy, id: Date.now().toString() })
      }
      
      return await DatabaseService.storeTradingStrategies(userId, strategies)
    } catch (error) {
      console.error('Error saving trading strategy:', error)
      return []
    }
  }

  static async deleteTradingStrategy(strategyId: string, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const strategies = await DatabaseService.getTradingStrategies(userId)
      const filtered = strategies.filter((s: any) => s.id !== strategyId)
      return await DatabaseService.storeTradingStrategies(userId, filtered)
    } catch (error) {
      console.error('Error deleting trading strategy:', error)
      return []
    }
  }

  // ===== STOCK COMPARISON SESSIONS =====
  
  static async getStockComparisonSessions(token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getStockComparisonSessions(userId)
    } catch (error) {
      console.error('Error getting stock comparison sessions:', error)
      return []
    }
  }

  static async saveStockComparisonSession(session: any, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const sessions = await DatabaseService.getStockComparisonSessions(userId)
      
      // Update existing or add new
      const index = sessions.findIndex((s: any) => s.id === session.id)
      if (index >= 0) {
        sessions[index] = session
      } else {
        sessions.push({ ...session, id: Date.now().toString() })
      }
      
      return await DatabaseService.storeStockComparisonSessions(userId, sessions)
    } catch (error) {
      console.error('Error saving stock comparison session:', error)
      return []
    }
  }

  // ===== MARKET SEARCH HISTORY =====
  
  static async getMarketSearchHistory(token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getMarketSearchHistory(userId)
    } catch (error) {
      console.error('Error getting market search history:', error)
      return []
    }
  }

  static async addMarketSearchHistory(search: any, token?: string): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId(token)
      const history = await DatabaseService.getMarketSearchHistory(userId)
      
      // Remove duplicate if exists
      const filtered = history.filter((h: any) => h.query !== search.query)
      
      // Add new search at the beginning
      const updated = [
        { ...search, timestamp: new Date().toISOString() },
        ...filtered
      ].slice(0, 20) // Keep only last 20 searches
      
      return await DatabaseService.storeMarketSearchHistory(userId, updated)
    } catch (error) {
      console.error('Error adding market search history:', error)
      return []
    }
  }

  // ===== USER PREFERENCES =====
  
  static async getUserPreferences(token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.getUserPreferences(userId)
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return DatabaseService.getDefaultPreferences()
    }
  }

  static async updateUserPreferences(preferences: any, token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.updateUserPreferences(userId, preferences)
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  // ===== MIGRATION UTILITIES =====
  
  static async migrateLocalStorageData(localStorageData: any, token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      return await DatabaseService.migrateLocalStorageData(userId, localStorageData)
    } catch (error) {
      console.error('Error migrating localStorage data:', error)
      throw error
    }
  }

  // ===== UTILITY METHODS =====
  
  static async clearAllUserData(token?: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId(token)
      const defaultPrefs = DatabaseService.getDefaultPreferences()
      
      await DatabaseService.updateUserPreferences(userId, {
        recentSearches: [],
        favoriteStocks: [],
        portfolioData: { positions: [], transactions: [], trades: [] },
        tradingStrategies: [],
        stockComparisonSessions: [],
        marketSearchHistory: [],
        ...defaultPrefs
      })
      
      console.log('✅ All user data cleared successfully')
    } catch (error) {
      console.error('Error clearing user data:', error)
      throw error
    }
  }

  static async exportUserData(token?: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId(token)
      
      const [
        preferences,
        recentSearches,
        favoriteStocks,
        portfolioData,
        tradingStrategies,
        stockComparisonSessions,
        marketSearchHistory
      ] = await Promise.all([
        DatabaseService.getUserPreferences(userId),
        DatabaseService.getRecentSearches(userId),
        DatabaseService.getFavoriteStocks(userId),
        DatabaseService.getPortfolioData(userId),
        DatabaseService.getTradingStrategies(userId),
        DatabaseService.getStockComparisonSessions(userId),
        DatabaseService.getMarketSearchHistory(userId)
      ])
      
      return {
        userId,
        exportDate: new Date().toISOString(),
        preferences,
        recentSearches,
        favoriteStocks,
        portfolioData,
        tradingStrategies,
        stockComparisonSessions,
        marketSearchHistory
      }
    } catch (error) {
      console.error('Error exporting user data:', error)
      throw error
    }
  }
}

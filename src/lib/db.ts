import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined
}

// Create a singleton Prisma client instance
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

// Database service for all user data operations
export class DatabaseService {
  // ===== WATCHLIST OPERATIONS =====
  
  // Create a new watchlist for a user
  static async createWatchlist(userId: string, name: string = 'My Watchlist') {
    try {
      const watchlist = await prisma.watchlist.create({
        data: {
          userId,
          name,
        },
        include: {
          items: true,
        },
      })
      return watchlist
    } catch (error) {
      console.error('Error creating watchlist:', error)
      throw error
    }
  }

  // Get all watchlists for a user
  static async getUserWatchlists(userId: string) {
    try {
      const watchlists = await prisma.watchlist.findMany({
        where: { userId },
        include: {
          items: {
            orderBy: { lastUpdated: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
      return watchlists
    } catch (error) {
      console.error('Error fetching user watchlists:', error)
      throw error
    }
  }

  // Get a specific watchlist with items
  static async getWatchlist(watchlistId: string) {
    try {
      const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
        include: {
          items: {
            orderBy: { lastUpdated: 'desc' },
          },
        },
      })
      return watchlist
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      throw error
    }
  }

  // Add a stock to a watchlist
  static async addToWatchlist(watchlistId: string, stockData: {
    symbol: string
    name: string
    type: string
    price: number
    change: number
    changePercent: number
    exchange?: string
    sector?: string
    industry?: string
    volume?: number
    marketCap?: number
  }) {
    try {
      // Check if item already exists
      const existingItem = await prisma.watchlistItem.findFirst({
        where: {
          watchlistId,
          symbol: stockData.symbol,
        },
      })

      if (existingItem) {
        // Update existing item
        const updatedItem = await prisma.watchlistItem.update({
          where: { id: existingItem.id },
          data: {
            name: stockData.name,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            exchange: stockData.exchange,
            sector: stockData.sector,
            industry: stockData.industry,
            volume: stockData.volume,
            marketCap: stockData.marketCap,
            lastUpdated: new Date(),
          },
        })
        return updatedItem
      } else {
        // Create new item
        const newItem = await prisma.watchlistItem.create({
          data: {
            watchlistId,
            symbol: stockData.symbol,
            name: stockData.name,
            type: stockData.type,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            exchange: stockData.exchange,
            sector: stockData.sector,
            industry: stockData.industry,
            volume: stockData.volume,
            marketCap: stockData.marketCap,
            lastUpdated: new Date(),
          },
        })
        return newItem
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      throw error
    }
  }

  // Remove a stock from a watchlist
  static async removeFromWatchlist(watchlistId: string, symbol: string) {
    try {
      console.log(`🗑️ Database: Removing ${symbol} from watchlist ${watchlistId}...`)
      
      // First, verify the watchlist exists
      const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId }
      })
      
      if (!watchlist) {
        throw new Error(`Watchlist ${watchlistId} not found`)
      }
      
      // Find the item to verify it exists
      const item = await prisma.watchlistItem.findFirst({
        where: {
          watchlistId,
          symbol: symbol.toUpperCase(), // Normalize symbol case
        },
      })
      
      if (!item) {
        throw new Error(`Stock ${symbol} not found in watchlist`)
      }
      
      // Delete the item
      const deletedItem = await prisma.watchlistItem.delete({
        where: {
          id: item.id
        },
      })
      
      console.log(`✅ Database: Successfully removed ${symbol} from watchlist ${watchlistId}`)
      return deletedItem
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error)
      throw error
    }
  }

  // Update stock data in watchlist
  static async updateWatchlistItem(itemId: string, stockData: {
    price?: number
    change?: number
    changePercent?: number
    exchange?: string
    sector?: string
    industry?: string
    volume?: number
    marketCap?: number
  }) {
    try {
      const updatedItem = await prisma.watchlistItem.update({
        where: { id: itemId },
        data: {
          ...(stockData.price !== undefined && { price: stockData.price }),
          ...(stockData.change !== undefined && { change: stockData.change }),
          ...(stockData.changePercent !== undefined && { changePercent: stockData.changePercent }),
          ...(stockData.exchange && { exchange: stockData.exchange }),
          ...(stockData.sector && { sector: stockData.sector }),
          ...(stockData.industry && { industry: stockData.industry }),
          ...(stockData.volume !== undefined && { volume: stockData.volume }),
          ...(stockData.marketCap !== undefined && { marketCap: stockData.marketCap }),
          lastUpdated: new Date(),
        },
      })
      return updatedItem
    } catch (error) {
      console.error('Error updating watchlist item:', error)
      throw error
    }
  }

  // Delete a watchlist
  static async deleteWatchlist(watchlistId: string) {
    try {
      const deletedWatchlist = await prisma.watchlist.delete({
        where: { id: watchlistId },
      })
      return deletedWatchlist
    } catch (error) {
      console.error('Error deleting watchlist:', error)
      throw error
    }
  }

  // ===== USER PREFERENCES AND SETTINGS =====

  // Get user preferences
  static async getUserPreferences(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
      })
      
      if (!user || !user.preferences) {
        return this.getDefaultPreferences()
      }
      
      return JSON.parse(user.preferences)
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return this.getDefaultPreferences()
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: any) {
    try {
      const currentPreferences = await this.getUserPreferences(userId)
      const updatedPreferences = { ...currentPreferences, ...preferences }
      
      await prisma.user.update({
        where: { id: userId },
        data: { preferences: JSON.stringify(updatedPreferences) }
      })
      
      return updatedPreferences
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  // Get default preferences
  static getDefaultPreferences() {
    return {
      theme: 'system',
      currency: 'USD',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      security: {
        mfaEnabled: false,
        trustedDevices: [],
        lastPasswordChange: new Date().toISOString()
      },
      trading: {
        defaultOrderType: 'market',
        defaultQuantity: 100,
        showConfirmations: true
      },
      display: {
        chartType: 'candlestick',
        timeFrame: '1D',
        showVolume: true,
        showIndicators: true
      }
    }
  }

  // ===== USER DATA STORAGE =====

  // Store recent searches for a user
  static async storeRecentSearch(userId: string, searchData: {
    query: string
    results: any[]
    timestamp: Date
  }) {
    try {
      const preferences = await this.getUserPreferences(userId)
      const recentSearches = preferences.recentSearches || []
      
      // Remove duplicate if exists
      const filteredSearches = recentSearches.filter(
        (search: any) => search.query !== searchData.query
      )
      
      // Add new search at the beginning
      const updatedSearches = [
        {
          query: searchData.query,
          results: searchData.results.slice(0, 5), // Store only first 5 results
          timestamp: searchData.timestamp.toISOString()
        },
        ...filteredSearches
      ].slice(0, 10) // Keep only last 10 searches
      
      await this.updateUserPreferences(userId, { recentSearches: updatedSearches })
      return updatedSearches
    } catch (error) {
      console.error('Error storing recent search:', error)
      throw error
    }
  }

  // Get recent searches for a user
  static async getRecentSearches(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.recentSearches || []
    } catch (error) {
      console.error('Error fetching recent searches:', error)
      return []
    }
  }

  // Store favorite stocks for a user
  static async storeFavoriteStocks(userId: string, favorites: any[]) {
    try {
      await this.updateUserPreferences(userId, { favoriteStocks: favorites })
      return favorites
    } catch (error) {
      console.error('Error storing favorite stocks:', error)
      throw error
    }
  }

  // Get favorite stocks for a user
  static async getFavoriteStocks(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.favoriteStocks || []
    } catch (error) {
      console.error('Error fetching favorite stocks:', error)
      return []
    }
  }

  // Store portfolio data for a user
  static async storePortfolioData(userId: string, portfolioData: {
    positions: any[]
    transactions: any[]
    trades: any[]
  }) {
    try {
      await this.updateUserPreferences(userId, { 
        portfolioData: {
          ...portfolioData,
          lastUpdated: new Date().toISOString()
        }
      })
      return portfolioData
    } catch (error) {
      console.error('Error storing portfolio data:', error)
      throw error
    }
  }

  // Get portfolio data for a user
  static async getPortfolioData(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.portfolioData || { positions: [], transactions: [], trades: [] }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      return { positions: [], transactions: [], trades: [] }
    }
  }

  // Store trading strategies for a user
  static async storeTradingStrategies(userId: string, strategies: any[]) {
    try {
      await this.updateUserPreferences(userId, { tradingStrategies: strategies })
      return strategies
    } catch (error) {
      console.error('Error storing trading strategies:', error)
      throw error
    }
  }

  // Get trading strategies for a user
  static async getTradingStrategies(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.tradingStrategies || []
    } catch (error) {
      console.error('Error fetching trading strategies:', error)
      return []
    }
  }

  // Store stock comparison sessions for a user
  static async storeStockComparisonSessions(userId: string, sessions: any[]) {
    try {
      await this.updateUserPreferences(userId, { stockComparisonSessions: sessions })
      return sessions
    } catch (error) {
      console.error('Error storing stock comparison sessions:', error)
      throw error
    }
  }

  // Get stock comparison sessions for a user
  static async getStockComparisonSessions(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.stockComparisonSessions || []
    } catch (error) {
      console.error('Error fetching stock comparison sessions:', error)
      return []
    }
  }

  // Store market search history for a user
  static async storeMarketSearchHistory(userId: string, history: any[]) {
    try {
      await this.updateUserPreferences(userId, { marketSearchHistory: history })
      return history
    } catch (error) {
      console.error('Error storing market search history:', error)
      throw error
    }
  }

  // Get market search history for a user
  static async getMarketSearchHistory(userId: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      return preferences.marketSearchHistory || []
    } catch (error) {
      console.error('Error fetching market search history:', error)
      return []
    }
  }

  // ===== UTILITY METHODS =====

  // Create or get a default user (for demo purposes)
  static async getOrCreateDemoUser() {
    try {
      let user = await prisma.user.findFirst({
        where: { email: 'demo@vidality.com' },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'demo@vidality.com',
            firstName: 'Demo',
            lastName: 'User',
            password: 'demo-password-hash',
            preferences: JSON.stringify(this.getDefaultPreferences()),
          },
        })
      }

      return user
    } catch (error) {
      console.error('Error getting or creating demo user:', error)
      throw error
    }
  }

  // Test database connection
  static async testConnection() {
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
  }

  // Migrate localStorage data to database for a user
  static async migrateLocalStorageData(userId: string, localStorageData: any) {
    try {
      const updates: any = {}
      
      // Migrate recent searches
      if (localStorageData.recentSearches) {
        updates.recentSearches = localStorageData.recentSearches
      }
      
      // Migrate favorite stocks
      if (localStorageData.favoriteStocks) {
        updates.favoriteStocks = localStorageData.favoriteStocks
      }
      
      // Migrate portfolio data
      if (localStorageData.portfolioData) {
        updates.portfolioData = localStorageData.portfolioData
      }
      
      // Migrate trading strategies
      if (localStorageData.tradingStrategies) {
        updates.tradingStrategies = localStorageData.tradingStrategies
      }
      
      // Migrate stock comparison sessions
      if (localStorageData.stockComparisonSessions) {
        updates.stockComparisonSessions = localStorageData.stockComparisonSessions
      }
      
      // Migrate market search history
      if (localStorageData.marketSearchHistory) {
        updates.marketSearchHistory = localStorageData.marketSearchHistory
      }
      
      if (Object.keys(updates).length > 0) {
        await this.updateUserPreferences(userId, updates)
        console.log('✅ Successfully migrated localStorage data to database')
      }
      
      return updates
    } catch (error) {
      console.error('Error migrating localStorage data:', error)
      throw error
    }
  }
}

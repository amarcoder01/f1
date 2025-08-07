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

// Database service for watchlist operations
export class DatabaseService {
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
      const deletedItem = await prisma.watchlistItem.deleteMany({
        where: {
          watchlistId,
          symbol,
        },
      })
      return deletedItem
    } catch (error) {
      console.error('Error removing from watchlist:', error)
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
            name: 'Demo User',
            settings: {
              theme: 'dark',
              notifications: true,
            },
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
}

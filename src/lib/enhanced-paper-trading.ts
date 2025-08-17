// Enhanced Paper Trading Service - Realistic Trading Simulation
import { 
  PaperTradingAccount, 
  PaperPosition, 
  PaperOrder, 
  PaperTransaction,
  PaperTradingStats,
  Stock
} from '@/types'
import { prisma } from './db'
import { getStockData } from './multi-source-api'

// Market hours configuration (US Eastern Time)
const MARKET_HOURS = {
  preMarket: { start: '04:00', end: '09:30' },
  regular: { start: '09:30', end: '16:00' },
  afterHours: { start: '16:00', end: '20:00' },
  closed: { start: '20:00', end: '04:00' }
}

// Trading rules and restrictions
const TRADING_RULES = {
  minOrderSize: 1,
  maxOrderSize: 1000000,
  maxPositionSize: 1000000,
  maxCashUsage: 0.95, // Can use up to 95% of available cash
  commission: {
    base: 0.99,
    large: 9.99,
    threshold: 1000
  },
  slippage: {
    small: 0.001, // 0.1% for orders < $10k
    medium: 0.002, // 0.2% for orders $10k-$100k
    large: 0.005  // 0.5% for orders > $100k
  }
}

export class EnhancedPaperTradingService {
  private static instance: EnhancedPaperTradingService
  private static realTimeDataCache = new Map<string, { data: Stock; timestamp: number }>()
  private static updateInterval: NodeJS.Timeout | null = null
  private static isRunning = false

  static getInstance(): EnhancedPaperTradingService {
    if (!EnhancedPaperTradingService.instance) {
      EnhancedPaperTradingService.instance = new EnhancedPaperTradingService()
    }
    return EnhancedPaperTradingService.instance
  }

  // Start real-time data updates
  startRealTimeUpdates(): void {
    if (EnhancedPaperTradingService.isRunning) return
    
    EnhancedPaperTradingService.isRunning = true
    console.log('🚀 Starting enhanced paper trading real-time updates...')
    
    // Update every 5 seconds during market hours, 30 seconds after hours
    EnhancedPaperTradingService.updateInterval = setInterval(() => {
      this.updateAllPositions()
    }, this.isMarketOpen() ? 5000 : 30000)
  }

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    if (EnhancedPaperTradingService.updateInterval) {
      clearInterval(EnhancedPaperTradingService.updateInterval)
      EnhancedPaperTradingService.updateInterval = null
    }
    EnhancedPaperTradingService.isRunning = false
    console.log('⏹️ Stopped enhanced paper trading updates')
  }

  // Check if market is currently open
  isMarketOpen(): boolean {
    const now = new Date()
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const currentTime = easternTime.toTimeString().slice(0, 5)
    
    return currentTime >= MARKET_HOURS.regular.start && currentTime < MARKET_HOURS.regular.end
  }

  // Check if we're in pre-market hours
  isPreMarket(): boolean {
    const now = new Date()
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const currentTime = easternTime.toTimeString().slice(0, 5)
    
    return currentTime >= MARKET_HOURS.preMarket.start && currentTime < MARKET_HOURS.preMarket.start
  }

  // Check if we're in after-hours
  isAfterHours(): boolean {
    const now = new Date()
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const currentTime = easternTime.toTimeString().slice(0, 5)
    
    return currentTime >= MARKET_HOURS.afterHours.start && currentTime < MARKET_HOURS.afterHours.end
  }

  // Get current market status
  getMarketStatus(): {
    isOpen: boolean
    status: 'pre-market' | 'open' | 'after-hours' | 'closed'
    nextOpen: string
    nextClose: string
  } {
    const now = new Date()
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const currentTime = easternTime.toTimeString().slice(0, 5)
    
    let status: 'pre-market' | 'open' | 'after-hours' | 'closed'
    let nextOpen = ''
    let nextClose = ''
    
    if (this.isPreMarket()) {
      status = 'pre-market'
      nextOpen = '09:30'
      nextClose = '16:00'
    } else if (this.isMarketOpen()) {
      status = 'open'
      nextOpen = '09:30'
      nextClose = '16:00'
    } else if (this.isAfterHours()) {
      status = 'after-hours'
      nextOpen = '09:30'
      nextClose = '16:00'
    } else {
      status = 'closed'
      nextOpen = '09:30'
      nextClose = '16:00'
    }
    
    return {
      isOpen: this.isMarketOpen(),
      status,
      nextOpen,
      nextClose
    }
  }

  // Create a new paper trading account with enhanced features
  async createAccount(userId: string, name: string, initialBalance: number = 100000): Promise<PaperTradingAccount> {
    try {
      // Validate initial balance
      if (initialBalance < 1000) {
        throw new Error('Minimum initial balance is $1,000')
      }
      if (initialBalance > 10000000) {
        throw new Error('Maximum initial balance is $10,000,000')
      }

      const account = await prisma.paperTradingAccount.create({
        data: {
          userId,
          name,
          initialBalance,
          currentBalance: initialBalance,
          availableCash: initialBalance,
          totalValue: initialBalance,
          totalPnL: 0,
          totalPnLPercent: 0,
          isActive: true,
        },
        include: {
          positions: true,
          orders: true,
          transactions: true,
        },
      })

      console.log(`✅ Created enhanced paper trading account: ${name} with $${initialBalance.toLocaleString()}`)
      return account as PaperTradingAccount
    } catch (error) {
      console.error('Error creating enhanced paper trading account:', error)
      throw new Error('Failed to create paper trading account')
    }
  }

  // Enhanced order placement with realistic execution
  async placeOrder(
    accountId: string,
    symbol: string,
    type: 'market' | 'limit' | 'stop' | 'stop-limit',
    side: 'buy' | 'sell',
    quantity: number,
    price?: number,
    stopPrice?: number,
    notes?: string
  ): Promise<PaperOrder> {
    try {
      // Validate order parameters
      if (quantity < TRADING_RULES.minOrderSize) {
        throw new Error(`Minimum order size is ${TRADING_RULES.minOrderSize} shares`)
      }
      if (quantity > TRADING_RULES.maxOrderSize) {
        throw new Error(`Maximum order size is ${TRADING_RULES.maxOrderSize.toLocaleString()} shares`)
      }

      if (type === 'limit' && !price) {
        throw new Error('Limit orders require a price')
      }
      if (type === 'stop' && !stopPrice) {
        throw new Error('Stop orders require a stop price')
      }
      if (type === 'stop-limit' && (!price || !stopPrice)) {
        throw new Error('Stop-limit orders require both price and stop price')
      }

      // Get current stock data
      const stockData = await getStockData(symbol)
      if (!stockData) {
        throw new Error(`Stock data not available for ${symbol}`)
      }

      // Get account
      const account = await this.getAccount(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      // Check trading restrictions based on market hours
      const marketStatus = this.getMarketStatus()
      if (type === 'market' && !marketStatus.isOpen && !marketStatus.status.includes('market')) {
        throw new Error('Market orders can only be placed during regular market hours')
      }

      // Check if user has enough cash for buy orders
      if (side === 'buy') {
        const estimatedPrice = price || stockData.price
        const requiredCash = estimatedPrice * quantity
        const maxCashUsage = account.availableCash * TRADING_RULES.maxCashUsage
        
        if (requiredCash > maxCashUsage) {
          throw new Error(`Insufficient cash. Required: $${requiredCash.toLocaleString()}, Available: $${maxCashUsage.toLocaleString()}`)
        }
      }

      // Check if user has enough shares for sell orders
      if (side === 'sell') {
        const position = account.positions.find(p => p.symbol === symbol)
        if (!position || position.quantity < quantity) {
          throw new Error(`Insufficient shares. Required: ${quantity}, Available: ${position?.quantity || 0}`)
        }
      }

      // Calculate commission
      const estimatedPrice = price || stockData.price
      const commission = this.calculateCommission(quantity, estimatedPrice)

      // Create the order
      const order = await prisma.paperOrder.create({
        data: {
          accountId,
          symbol,
          type,
          side,
          quantity,
          price,
          stopPrice,
          status: 'pending',
          filledQuantity: 0,
          commission,
          notes,
        },
      })

      console.log(`📋 Created ${type} ${side} order for ${quantity} shares of ${symbol}`)

      // Process market orders immediately
      if (type === 'market') {
        await this.processMarketOrder(order.id)
      }

      return order as PaperOrder
    } catch (error) {
      console.error('Error placing enhanced paper trading order:', error)
      throw error
    }
  }

  // Enhanced market order processing with realistic execution
  async processMarketOrder(orderId: string): Promise<void> {
    try {
      const order = await prisma.paperOrder.findUnique({
        where: { id: orderId },
        include: { account: true },
      })

      if (!order || order.status !== 'pending') {
        return
      }

      // Get current stock price
      const stockData = await getStockData(order.symbol)
      if (!stockData) {
        throw new Error(`Stock data not available for ${order.symbol}`)
      }

      // Calculate execution price with slippage
      const basePrice = stockData.price
      const slippage = this.calculateSlippage(order.quantity * basePrice)
      const executionPrice = order.side === 'buy' 
        ? basePrice * (1 + slippage) 
        : basePrice * (1 - slippage)

      const totalAmount = executionPrice * order.quantity
      const commission = this.calculateCommission(order.quantity, executionPrice)

      // Update order
      await prisma.paperOrder.update({
        where: { id: orderId },
        data: {
          status: 'filled',
          filledQuantity: order.quantity,
          averagePrice: executionPrice,
        },
      })

      // Create transaction
      await prisma.paperTransaction.create({
        data: {
          accountId: order.accountId,
          orderId: orderId,
          symbol: order.symbol,
          type: order.side,
          quantity: order.quantity,
          price: executionPrice,
          amount: totalAmount + commission,
          commission,
          description: `${order.side.toUpperCase()} ${order.quantity} shares of ${order.symbol} at $${executionPrice.toFixed(2)} (slippage: ${(slippage * 100).toFixed(2)}%)`,
        },
      })

      // Update account and positions
      await this.updateAccountAfterTrade(order.accountId, order.symbol, order.side as 'buy' | 'sell', order.quantity, executionPrice, commission)
      
      console.log(`✅ Executed market order: ${order.side} ${order.quantity} ${order.symbol} at $${executionPrice.toFixed(2)}`)
    } catch (error) {
      console.error('Error processing enhanced market order:', error)
      throw error
    }
  }

  // Enhanced account update after trade
  async updateAccountAfterTrade(
    accountId: string,
    symbol: string,
    side: 'buy' | 'sell',
    quantity: number,
    price: number,
    commission: number
  ): Promise<void> {
    try {
      const account = await this.getAccount(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      const totalAmount = price * quantity
      const netAmount = side === 'buy' ? totalAmount + commission : totalAmount - commission

      // Update cash
      const newCash = side === 'buy' 
        ? account.availableCash - netAmount 
        : account.availableCash + netAmount

      // Update or create position
      let position = account.positions.find(p => p.symbol === symbol)
      
      if (side === 'buy') {
        if (position) {
          // Update existing position
          const newQuantity = position.quantity + quantity
          const newAveragePrice = ((position.quantity * position.averagePrice) + totalAmount) / newQuantity
          
          await prisma.paperPosition.update({
            where: { id: position.id },
            data: {
              quantity: newQuantity,
              averagePrice: newAveragePrice,
              lastUpdated: new Date(),
            },
          })
        } else {
          // Create new position
          await prisma.paperPosition.create({
            data: {
              accountId,
              symbol,
              name: symbol, // Will be updated with real data
              quantity,
              averagePrice: price,
              currentPrice: price,
              marketValue: totalAmount,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
              type: 'stock',
              entryDate: new Date(),
              lastUpdated: new Date(),
            },
          })
        }
      } else {
        // Sell order
        if (position && position.quantity >= quantity) {
          const newQuantity = position.quantity - quantity
          
          if (newQuantity === 0) {
            // Close position
            await prisma.paperPosition.delete({
              where: { id: position.id },
            })
          } else {
            // Update position
            await prisma.paperPosition.update({
              where: { id: position.id },
              data: {
                quantity: newQuantity,
                lastUpdated: new Date(),
              },
            })
          }
        }
      }

      // Update account cash
      await prisma.paperTradingAccount.update({
        where: { id: accountId },
        data: {
          availableCash: newCash,
          updatedAt: new Date(),
        },
      })

      // Update account totals
      await this.updateAccountTotals(accountId)
    } catch (error) {
      console.error('Error updating enhanced account after trade:', error)
      throw error
    }
  }

  // Enhanced account totals update with real-time data
  async updateAccountTotals(accountId: string): Promise<void> {
    try {
      const account = await this.getAccount(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      // Update positions with current prices
      let totalPositionValue = 0
      for (const position of account.positions) {
        const stockData = await getStockData(position.symbol)
        if (stockData) {
          const currentPrice = stockData.price
          const marketValue = currentPrice * position.quantity
          const unrealizedPnL = marketValue - (position.averagePrice * position.quantity)
          const unrealizedPnLPercent = position.averagePrice > 0 
            ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100 
            : 0

          await prisma.paperPosition.update({
            where: { id: position.id },
            data: {
              currentPrice,
              marketValue,
              unrealizedPnL,
              unrealizedPnLPercent,
              lastUpdated: new Date(),
            },
          })

          totalPositionValue += marketValue
        }
      }

      const totalValue = account.availableCash + totalPositionValue
      const totalPnL = totalValue - account.initialBalance
      const totalPnLPercent = account.initialBalance > 0 
        ? (totalPnL / account.initialBalance) * 100 
        : 0

      // Update account
      await prisma.paperTradingAccount.update({
        where: { id: accountId },
        data: {
          totalValue,
          totalPnL,
          totalPnLPercent,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error updating enhanced account totals:', error)
      throw error
    }
  }

  // Update all positions with real-time data
  private async updateAllPositions(): Promise<void> {
    try {
      const accounts = await prisma.paperTradingAccount.findMany({
        include: { positions: true }
      })

      for (const account of accounts) {
        for (const position of account.positions) {
          try {
            const stockData = await getStockData(position.symbol)
            if (stockData) {
              const currentPrice = stockData.price
              const marketValue = currentPrice * position.quantity
              const unrealizedPnL = marketValue - (position.averagePrice * position.quantity)
              const unrealizedPnLPercent = position.averagePrice > 0 
                ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100 
                : 0

              await prisma.paperPosition.update({
                where: { id: position.id },
                data: {
                  currentPrice,
                  marketValue,
                  unrealizedPnL,
                  unrealizedPnLPercent,
                  lastUpdated: new Date(),
                },
              })

              // Update cache
              EnhancedPaperTradingService.realTimeDataCache.set(position.symbol, {
                data: stockData,
                timestamp: Date.now()
              })
            }
          } catch (error) {
            console.error(`Error updating position ${position.symbol}:`, error)
          }
        }

        // Update account totals after position updates
        await this.updateAccountTotals(account.id)
      }
    } catch (error) {
      console.error('Error updating all positions:', error)
    }
  }

  // Enhanced commission calculation
  private calculateCommission(quantity: number, price: number): number {
    const tradeValue = quantity * price
    if (tradeValue < TRADING_RULES.commission.threshold) {
      return TRADING_RULES.commission.base
    } else {
      return TRADING_RULES.commission.large
    }
  }

  // Calculate slippage based on order size
  private calculateSlippage(tradeValue: number): number {
    if (tradeValue < 10000) {
      return TRADING_RULES.slippage.small
    } else if (tradeValue < 100000) {
      return TRADING_RULES.slippage.medium
    } else {
      return TRADING_RULES.slippage.large
    }
  }

  // Get account with enhanced data
  async getAccount(accountId: string): Promise<PaperTradingAccount | null> {
    try {
      const account = await prisma.paperTradingAccount.findUnique({
        where: { id: accountId },
        include: {
          positions: true,
          orders: {
            orderBy: { createdAt: 'desc' },
          },
          transactions: {
            orderBy: { timestamp: 'desc' },
          },
        },
      })

      return account as PaperTradingAccount | null
    } catch (error) {
      console.error('Error fetching enhanced paper trading account:', error)
      throw new Error('Failed to fetch paper trading account')
    }
  }

  // Get all accounts for a user
  async getAccounts(userId: string): Promise<PaperTradingAccount[]> {
    try {
      const accounts = await prisma.paperTradingAccount.findMany({
        where: { userId },
        include: {
          positions: true,
          orders: {
            orderBy: { createdAt: 'desc' },
          },
          transactions: {
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return accounts as PaperTradingAccount[]
    } catch (error) {
      console.error('Error fetching enhanced paper trading accounts:', error)
      throw new Error('Failed to fetch paper trading accounts')
    }
  }

  // Get real-time data for a symbol
  async getRealTimeData(symbol: string): Promise<Stock | null> {
    try {
      // Check cache first
      const cached = EnhancedPaperTradingService.realTimeDataCache.get(symbol)
      if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
        return cached.data
      }

      // Fetch fresh data
      const stockData = await getStockData(symbol)
      if (stockData) {
        EnhancedPaperTradingService.realTimeDataCache.set(symbol, {
          data: stockData,
          timestamp: Date.now()
        })
      }

      return stockData
    } catch (error) {
      console.error(`Error fetching real-time data for ${symbol}:`, error)
      return null
    }
  }

  // Get enhanced trading statistics
  async getEnhancedTradingStats(accountId: string): Promise<PaperTradingStats> {
    try {
      const account = await this.getAccount(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      const transactions = await prisma.paperTransaction.findMany({
        where: { 
          accountId,
          type: { in: ['buy', 'sell'] }
        },
        orderBy: { timestamp: 'asc' },
      })

      // Calculate enhanced statistics
      const stats = await this.calculateAdvancedStats(account, transactions)
      return stats
    } catch (error) {
      console.error('Error calculating enhanced trading stats:', error)
      throw new Error('Failed to calculate trading statistics')
    }
  }

  // Calculate advanced trading statistics
  private async calculateAdvancedStats(account: PaperTradingAccount, transactions: any[]): Promise<PaperTradingStats> {
    // Implementation of advanced statistics calculation
    // This would include Sharpe ratio, max drawdown, volatility, etc.
    
    // For now, return basic stats
    return {
      totalTrades: transactions.length / 2, // Each trade has buy and sell
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      totalReturn: account.totalPnL,
      annualizedReturn: 0,
    }
  }

  // Cancel an order with enhanced validation
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const order = await prisma.paperOrder.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'pending') {
        throw new Error('Order cannot be cancelled')
      }

      // Check if market is open for cancellation
      const marketStatus = this.getMarketStatus()
      if (!marketStatus.isOpen && !marketStatus.status.includes('market')) {
        throw new Error('Orders can only be cancelled during market hours')
      }

      await prisma.paperOrder.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
      })

      console.log(`❌ Cancelled order: ${order.symbol} ${order.quantity} shares`)
    } catch (error) {
      console.error('Error cancelling enhanced order:', error)
      throw error
    }
  }

  // Delete account with enhanced cleanup
  async deleteAccount(accountId: string): Promise<void> {
    try {
      const account = await this.getAccount(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      // Check if account has open positions
      if (account.positions.length > 0) {
        throw new Error('Cannot delete account with open positions. Please close all positions first.')
      }

      // Check if account has pending orders
      const pendingOrders = account.orders.filter(o => o.status === 'pending')
      if (pendingOrders.length > 0) {
        throw new Error('Cannot delete account with pending orders. Please cancel all orders first.')
      }

      // Delete all related data
      await prisma.paperTransaction.deleteMany({ where: { accountId } })
      await prisma.paperOrder.deleteMany({ where: { accountId } })
      await prisma.paperPosition.deleteMany({ where: { accountId } })
      await prisma.paperTradingAccount.delete({ where: { id: accountId } })

      console.log(`✅ Enhanced account ${accountId} deleted successfully`)
    } catch (error) {
      console.error('Error deleting enhanced paper trading account:', error)
      throw new Error('Failed to delete account')
    }
  }
}

// Export singleton instance
export const enhancedPaperTrading = EnhancedPaperTradingService.getInstance()

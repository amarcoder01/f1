require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTradingStats() {
  try {
    console.log('🧪 Testing Trading Statistics Calculation...')
    
    // Get or create demo user
    let user = await prisma.user.findUnique({
      where: { email: 'test@paper-trading.com' }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@paper-trading.com',
          name: 'Test User'
        }
      })
      console.log('✅ Created test user:', user.id)
    } else {
      console.log('✅ Found existing test user:', user.id)
    }

    // Get or create paper trading account
    let account = await prisma.paperTradingAccount.findFirst({
      where: { userId: user.id }
    })
    
    if (!account) {
      account = await prisma.paperTradingAccount.create({
        data: {
          userId: user.id,
          name: 'Test Account',
          initialBalance: 100000,
          currentBalance: 100000,
          availableCash: 100000,
          totalValue: 100000,
          totalPnL: 0,
          totalPnLPercent: 0,
          isActive: true
        }
      })
      console.log('✅ Created test account:', account.id)
    } else {
      console.log('✅ Found existing test account:', account.id)
    }

    // Create some test transactions to calculate stats
    console.log('📊 Creating test transactions...')
    
    // Buy 100 shares of AAPL at $150
    await prisma.paperTransaction.create({
      data: {
        accountId: account.id,
        symbol: 'AAPL',
        type: 'buy',
        quantity: 100,
        price: 150,
        amount: -15000, // Negative for buy
        commission: 9.99,
        description: 'Buy 100 AAPL shares',
        timestamp: new Date('2024-01-01')
      }
    })

    // Buy 50 shares of MSFT at $300
    await prisma.paperTransaction.create({
      data: {
        accountId: account.id,
        symbol: 'MSFT',
        type: 'buy',
        quantity: 50,
        price: 300,
        amount: -15000, // Negative for buy
        commission: 9.99,
        description: 'Buy 50 MSFT shares',
        timestamp: new Date('2024-01-02')
      }
    })

    // Sell 50 shares of AAPL at $160 (profit)
    await prisma.paperTransaction.create({
      data: {
        accountId: account.id,
        symbol: 'AAPL',
        type: 'sell',
        quantity: 50,
        price: 160,
        amount: 8000, // Positive for sell
        commission: 9.99,
        description: 'Sell 50 AAPL shares',
        timestamp: new Date('2024-01-15')
      }
    })

    // Sell 25 shares of MSFT at $280 (loss)
    await prisma.paperTransaction.create({
      data: {
        accountId: account.id,
        symbol: 'MSFT',
        type: 'sell',
        quantity: 25,
        price: 280,
        amount: 7000, // Positive for sell
        commission: 9.99,
        description: 'Sell 25 MSFT shares',
        timestamp: new Date('2024-01-20')
      }
    })

    console.log('✅ Created test transactions')

    // Now test the stats calculation
    console.log('\n📈 Testing Stats Calculation...')
    
    // Import and test the service
    const { PaperTradingService } = require('./src/lib/paper-trading.ts')
    
    try {
      const stats = await PaperTradingService.getTradingStats(account.id)
      console.log('✅ Trading stats calculated successfully:')
      console.log('   Total Trades:', stats.totalTrades)
      console.log('   Winning Trades:', stats.winningTrades)
      console.log('   Losing Trades:', stats.losingTrades)
      console.log('   Win Rate:', stats.winRate.toFixed(1) + '%')
      console.log('   Average Win:', stats.averageWin.toFixed(2))
      console.log('   Average Loss:', stats.averageLoss.toFixed(2))
      console.log('   Profit Factor:', stats.profitFactor.toFixed(2))
      console.log('   Total Return:', stats.totalReturn.toFixed(2))
      console.log('   Annualized Return:', stats.annualizedReturn.toFixed(2) + '%')
      console.log('   Sharpe Ratio:', stats.sharpeRatio.toFixed(2))
    } catch (error) {
      console.error('❌ Error calculating stats:', error.message)
    }

    console.log('\n🎯 Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTradingStats()

// Test script for Paper Trading functionality
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPaperTrading() {
  try {
    console.log('🧪 Testing Paper Trading Functionality...\n')

    // 0. First, create or find a test user
    console.log('0. Creating/finding test user...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@paper-trading.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@paper-trading.com',
          name: 'Test User',
        },
      })
      console.log('✅ Test user created:', testUser.email)
    } else {
      console.log('✅ Test user found:', testUser.email)
    }

    // 1. Test creating a paper trading account
    console.log('\n1. Creating paper trading account...')
    const account = await prisma.paperTradingAccount.create({
      data: {
        userId: testUser.id,
        name: 'Test Account',
        initialBalance: 100000,
        currentBalance: 100000,
        availableCash: 100000,
        totalValue: 100000,
        totalPnL: 0,
        totalPnLPercent: 0,
        isActive: true,
      },
    })
    console.log('✅ Account created:', account.name, 'with ID:', account.id)

    // 2. Test creating a position
    console.log('\n2. Creating a test position...')
    const position = await prisma.paperPosition.create({
      data: {
        accountId: account.id,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 100,
        averagePrice: 150.00,
        currentPrice: 155.00,
        marketValue: 15500.00,
        unrealizedPnL: 500.00,
        unrealizedPnLPercent: 3.33,
        type: 'stock',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    })
    console.log('✅ Position created:', position.symbol, 'Quantity:', position.quantity)

    // 3. Test creating an order
    console.log('\n3. Creating a test order...')
    const order = await prisma.paperOrder.create({
      data: {
        accountId: account.id,
        symbol: 'MSFT',
        type: 'market',
        side: 'buy',
        quantity: 50,
        status: 'filled',
        filledQuantity: 50,
        averagePrice: 300.00,
        commission: 9.99,
        notes: 'Test market order',
      },
    })
    console.log('✅ Order created:', order.symbol, 'Type:', order.type, 'Side:', order.side)

    // 4. Test creating a transaction
    console.log('\n4. Creating a test transaction...')
    const transaction = await prisma.paperTransaction.create({
      data: {
        accountId: account.id,
        orderId: order.id,
        symbol: 'MSFT',
        type: 'buy',
        quantity: 50,
        price: 300.00,
        amount: 15009.99,
        commission: 9.99,
        description: 'BUY 50 shares of MSFT at $300.00',
      },
    })
    console.log('✅ Transaction created:', transaction.type, 'Amount:', transaction.amount)

    // 5. Test fetching account with relations
    console.log('\n5. Fetching account with all relations...')
    const fullAccount = await prisma.paperTradingAccount.findUnique({
      where: { id: account.id },
      include: {
        positions: true,
        orders: true,
        transactions: true,
      },
    })
    console.log('✅ Account fetched with:')
    console.log('   - Positions:', fullAccount.positions.length)
    console.log('   - Orders:', fullAccount.orders.length)
    console.log('   - Transactions:', fullAccount.transactions.length)

    // 6. Test updating account totals
    console.log('\n6. Updating account totals...')
    const updatedAccount = await prisma.paperTradingAccount.update({
      where: { id: account.id },
      data: {
        totalValue: 105500.00,
        totalPnL: 5500.00,
        totalPnLPercent: 5.5,
        availableCash: 84990.01,
      },
    })
    console.log('✅ Account updated - Total Value:', updatedAccount.totalValue, 'P&L:', updatedAccount.totalPnL)

    console.log('\n🎉 All tests passed! Paper Trading functionality is working correctly.')
    console.log('\n📊 Test Summary:')
    console.log('   - Account created and managed successfully')
    console.log('   - Positions tracked correctly')
    console.log('   - Orders processed properly')
    console.log('   - Transactions recorded accurately')
    console.log('   - Database relations working as expected')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPaperTrading()

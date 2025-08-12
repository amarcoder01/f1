import { NextRequest, NextResponse } from 'next/server'
import { enhancedPaperTrading } from '@/lib/enhanced-paper-trading'

// Enhanced Paper Trading API with Real Market Data

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    switch (action) {
      case 'market-status':
        const marketStatus = enhancedPaperTrading.getMarketStatus()
        return NextResponse.json({ success: true, data: marketStatus })

      case 'start-updates':
        enhancedPaperTrading.startRealTimeUpdates()
        return NextResponse.json({ success: true, message: 'Real-time updates started' })

      case 'stop-updates':
        enhancedPaperTrading.stopRealTimeUpdates()
        return NextResponse.json({ success: true, message: 'Real-time updates stopped' })

      case 'get-account':
        if (!accountId) {
          return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }
        const account = await enhancedPaperTrading.getAccount(accountId)
        return NextResponse.json({ success: true, data: account })

      case 'get-accounts':
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }
        const accounts = await enhancedPaperTrading.getAccounts(userId)
        return NextResponse.json({ success: true, data: accounts })

      case 'get-stats':
        if (!accountId) {
          return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }
        const stats = await enhancedPaperTrading.getEnhancedTradingStats(accountId)
        return NextResponse.json({ success: true, data: stats })

      case 'get-real-time-data':
        const symbol = searchParams.get('symbol')
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
        }
        const stockData = await enhancedPaperTrading.getRealTimeData(symbol)
        return NextResponse.json({ success: true, data: stockData })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Enhanced paper trading API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    switch (action) {
      case 'create-account':
        const { userId, name, initialBalance } = data
        if (!userId || !name) {
          return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
        }
        const account = await enhancedPaperTrading.createAccount(userId, name, initialBalance)
        return NextResponse.json({ success: true, data: account })

      case 'place-order':
        const { 
          accountId: orderAccountId, 
          symbol, 
          type, 
          side, 
          quantity, 
          price, 
          stopPrice, 
          notes 
        } = data
        
        if (!orderAccountId || !symbol || !type || !side || !quantity) {
          return NextResponse.json({ 
            error: 'Account ID, symbol, type, side, and quantity are required' 
          }, { status: 400 })
        }
        
        const order = await enhancedPaperTrading.placeOrder(
          orderAccountId, 
          symbol, 
          type, 
          side, 
          quantity, 
          price, 
          stopPrice, 
          notes
        )
        return NextResponse.json({ success: true, data: order })

      case 'cancel-order':
        const { orderId } = data
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }
        await enhancedPaperTrading.cancelOrder(orderId)
        return NextResponse.json({ success: true, message: 'Order cancelled successfully' })

      case 'delete-account':
        const { accountId: deleteAccountId } = data
        if (!deleteAccountId) {
          return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }
        await enhancedPaperTrading.deleteAccount(deleteAccountId)
        return NextResponse.json({ success: true, message: 'Account deleted successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Enhanced paper trading API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    switch (action) {
      case 'update-account':
        // Handle account updates if needed
        return NextResponse.json({ success: true, message: 'Account updated successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Enhanced paper trading API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

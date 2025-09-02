import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { AuthService } from '@/lib/auth-service'

// POST - Add item to watchlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stockData = await request.json()
    
    // Validate required fields
    if (!stockData.symbol || !stockData.name || !stockData.price) {
      console.error('❌ Missing required fields:', { symbol: stockData.symbol, name: stockData.name, price: stockData.price })
      return NextResponse.json(
        { success: false, message: 'Missing required fields: symbol, name, and price are required' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 API: Adding ${stockData.symbol} to watchlist ${params.id}...`)
    console.log(`📊 Stock data:`, stockData)
    
    // Verify watchlist belongs to authenticated user
    const token = request.cookies.get('token')?.value
    let user

    if (token) {
      user = await AuthService.getUserFromToken(token)
    }

    if (!user) {
      user = await DatabaseService.getOrCreateDemoUser()
    }

    // Verify watchlist exists and belongs to user
    const watchlist = await DatabaseService.getWatchlist(params.id)
    if (!watchlist || watchlist.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Watchlist not found or access denied' },
        { status: 404 }
      )
    }

    const item = await DatabaseService.addToWatchlist(params.id, {
      symbol: stockData.symbol,
      name: stockData.name,
      type: stockData.type || 'stock',
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent,
      exchange: stockData.exchange,
      sector: stockData.sector,
      industry: stockData.industry,
      volume: stockData.volume,
      marketCap: stockData.marketCap,
    })
    
    console.log(`✅ Database: Successfully added ${stockData.symbol} to watchlist ${params.id}`)
    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('❌ Error adding item to watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add item to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      console.error('❌ API: Missing symbol parameter in DELETE request')
      return NextResponse.json(
        { success: false, message: 'Symbol parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`🗑️ API: Removing ${symbol} from watchlist ${params.id}...`)
    
    // Verify watchlist belongs to authenticated user
    const token = request.cookies.get('token')?.value
    let user

    if (token) {
      user = await AuthService.getUserFromToken(token)
    }

    if (!user) {
      user = await DatabaseService.getOrCreateDemoUser()
    }

    console.log(`👤 API: User authenticated: ${user.id}`)

    // Verify watchlist exists and belongs to user
    const watchlist = await DatabaseService.getWatchlist(params.id)
    if (!watchlist || watchlist.userId !== user.id) {
      console.error(`❌ API: Watchlist ${params.id} not found or access denied for user ${user.id}`)
      return NextResponse.json(
        { success: false, message: 'Watchlist not found or access denied' },
        { status: 404 }
      )
    }

    console.log(`✅ API: Watchlist ${params.id} verified for user ${user.id}`)

    await DatabaseService.removeFromWatchlist(params.id, symbol)
    console.log(`✅ API: Successfully removed ${symbol} from watchlist ${params.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from watchlist successfully'
    })
  } catch (error) {
    console.error('❌ API: Error removing item from watchlist:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to remove item from watchlist' },
      { status: 500 }
    )
  }
}
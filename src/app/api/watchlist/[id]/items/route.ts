import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// In-memory storage for development/testing
const inMemoryWatchlists = new Map()

// Initialize default watchlist in memory if it doesn't exist
if (!inMemoryWatchlists.has('default')) {
  inMemoryWatchlists.set('default', [])
  console.log('📝 Initialized default in-memory watchlist')
}

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
    
    // Try database first, fallback to in-memory storage
    try {
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
      
      console.log(`✅ Database: Successfully added ${stockData.symbol}`)
      return NextResponse.json({
        success: true,
        data: item
      })
    } catch (dbError) {
      console.log(`⚠️ Database failed, using in-memory storage:`, dbError)
      console.log(`📝 Proceeding with in-memory storage for watchlist: ${params.id}`)
      
      // Fallback to in-memory storage
      const watchlistId = params.id
      if (!inMemoryWatchlists.has(watchlistId)) {
        inMemoryWatchlists.set(watchlistId, [])
        console.log(`📝 Created in-memory watchlist: ${watchlistId}`)
      }
      
      const watchlist = inMemoryWatchlists.get(watchlistId)
      console.log(`📊 Current in-memory watchlist items:`, watchlist.length)
      
      // Check if item already exists
      const existingIndex = watchlist.findIndex(item => item.symbol === stockData.symbol)
      
      if (existingIndex >= 0) {
        // Update existing item
        watchlist[existingIndex] = {
          ...watchlist[existingIndex],
          name: stockData.name,
          price: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          exchange: stockData.exchange,
          sector: stockData.sector,
          industry: stockData.industry,
          volume: stockData.volume,
          marketCap: stockData.marketCap,
          lastUpdated: new Date().toISOString()
        }
      } else {
        // Add new item
        const newItem = {
          id: Date.now().toString(),
          watchlistId,
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
          lastUpdated: new Date().toISOString(),
          addedAt: new Date().toISOString()
        }
        watchlist.push(newItem)
        console.log(`📝 Added new item to in-memory watchlist: ${stockData.symbol}`)
      }
      
      const addedItem = watchlist.find(item => item.symbol === stockData.symbol)
      console.log(`✅ In-memory: Successfully added ${stockData.symbol}`, addedItem)
      return NextResponse.json({
        success: true,
        data: addedItem
      })
    }
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
      return NextResponse.json(
        { success: false, message: 'Symbol parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`🗑️ API: Removing ${symbol} from watchlist ${params.id}...`)
    
    // Try database first, fallback to in-memory storage
    try {
      await DatabaseService.removeFromWatchlist(params.id, symbol)
      console.log(`✅ Database: Successfully removed ${symbol}`)
    } catch (dbError) {
      console.log(`⚠️ Database failed, using in-memory storage:`, dbError)
      
      // Fallback to in-memory storage
      const watchlistId = params.id
      if (inMemoryWatchlists.has(watchlistId)) {
        const watchlist = inMemoryWatchlists.get(watchlistId)
        const index = watchlist.findIndex(item => item.symbol === symbol)
        if (index >= 0) {
          watchlist.splice(index, 1)
          console.log(`✅ In-memory: Successfully removed ${symbol}`)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from watchlist successfully'
    })
  } catch (error) {
    console.error('❌ Error removing item from watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from watchlist' },
      { status: 500 }
    )
  }
}
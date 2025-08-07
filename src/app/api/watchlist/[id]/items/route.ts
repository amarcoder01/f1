import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// POST - Add item to watchlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stockData = await request.json()
    
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
    
    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Error adding item to watchlist:', error)
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
    
    await DatabaseService.removeFromWatchlist(params.id, symbol)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from watchlist successfully'
    })
  } catch (error) {
    console.error('Error removing item from watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from watchlist' },
      { status: 500 }
    )
  }
}
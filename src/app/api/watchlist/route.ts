import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET - Get user's watchlists
export async function GET() {
  try {
    // For demo purposes, use the demo user
    const user = await DatabaseService.getOrCreateDemoUser()
    const watchlists = await DatabaseService.getUserWatchlists(user.id)
    
    return NextResponse.json({
      success: true,
      data: watchlists
    })
  } catch (error) {
    console.error('Error fetching watchlists:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch watchlists' },
      { status: 500 }
    )
  }
}

// POST - Create a new watchlist
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    const user = await DatabaseService.getOrCreateDemoUser()
    const watchlist = await DatabaseService.createWatchlist(user.id, name || 'My Watchlist')
    
    return NextResponse.json({
      success: true,
      data: watchlist
    })
  } catch (error) {
    console.error('Error creating watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
} 
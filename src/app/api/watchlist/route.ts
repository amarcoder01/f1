import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { AuthService } from '@/lib/auth-service'

// GET - Get user's watchlists
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting watchlists...')
    
    // Get user from token
    const token = request.cookies.get('token')?.value
    let user

    if (token) {
      // Try to get authenticated user
      user = await AuthService.getUserFromToken(token)
    }

    if (!user) {
      // Fallback to demo user for unauthenticated requests
      user = await DatabaseService.getOrCreateDemoUser()
    }

    const watchlists = await DatabaseService.getUserWatchlists(user.id)
    
    console.log(`✅ Database: Found ${watchlists.length} watchlists for user ${user.id}`)
    return NextResponse.json({
      success: true,
      data: watchlists
    })
  } catch (error) {
    console.error('❌ Error getting watchlists:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get watchlists' },
      { status: 500 }
    )
  }
}

// POST - Create a new watchlist
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    console.log(`🔍 API: Creating watchlist "${name}"...`)
    
    // Get user from token
    const token = request.cookies.get('token')?.value
    let user

    if (token) {
      // Try to get authenticated user
      user = await AuthService.getUserFromToken(token)
    }

    if (!user) {
      // Fallback to demo user for unauthenticated requests
      user = await DatabaseService.getOrCreateDemoUser()
    }

    const watchlist = await DatabaseService.createWatchlist(user.id, name || 'My Watchlist')
    
    console.log(`✅ Database: Created watchlist "${name}" for user ${user.id}`)
    return NextResponse.json({
      success: true,
      data: watchlist
    })
  } catch (error) {
    console.error('❌ Error creating watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
} 
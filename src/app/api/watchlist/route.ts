import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// In-memory storage for development/testing
const inMemoryWatchlists = new Map()

// Initialize default watchlist in memory
const defaultWatchlist = {
  id: 'default',
  name: 'My Watchlist',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Initialize the default watchlist
inMemoryWatchlists.set('default', [])

// GET - Get user's watchlists
export async function GET() {
  try {
    console.log('🔍 API: Getting watchlists...')
    
    // Try database first, fallback to in-memory storage
    try {
      const user = await DatabaseService.getOrCreateDemoUser()
      const watchlists = await DatabaseService.getUserWatchlists(user.id)
      
      console.log(`✅ Database: Found ${watchlists.length} watchlists`)
      return NextResponse.json({
        success: true,
        data: watchlists
      })
    } catch (dbError) {
      console.log(`⚠️ Database failed, using in-memory storage:`, dbError)
      
      // Fallback to in-memory storage
      console.log(`✅ In-memory: Returning default watchlist`)
      return NextResponse.json({
        success: true,
        data: [defaultWatchlist]
      })
    }
  } catch (error) {
    console.error('❌ Error fetching watchlists:', error)
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
    
    console.log(`🔍 API: Creating watchlist "${name}"...`)
    
    // Try database first, fallback to in-memory storage
    try {
      const user = await DatabaseService.getOrCreateDemoUser()
      const watchlist = await DatabaseService.createWatchlist(user.id, name || 'My Watchlist')
      
      console.log(`✅ Database: Created watchlist "${name}"`)
      return NextResponse.json({
        success: true,
        data: watchlist
      })
    } catch (dbError) {
      console.log(`⚠️ Database failed, using in-memory storage:`, dbError)
      
      // Fallback to in-memory storage
      const newWatchlist = {
        id: Date.now().toString(),
        name: name || 'My Watchlist',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      inMemoryWatchlists.set(newWatchlist.id, [])
      
      console.log(`✅ In-memory: Created watchlist "${name}"`)
      return NextResponse.json({
        success: true,
        data: newWatchlist
      })
    }
  } catch (error) {
    console.error('❌ Error creating watchlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
} 
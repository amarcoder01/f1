import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    
    // Test database connection
    const isConnected = await DatabaseService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed',
          error: 'Please check your DATABASE_URL in .env.local'
        },
        { status: 500 }
      )
    }

    // Try to get or create demo user
    const user = await DatabaseService.getOrCreateDemoUser()
    
    // Try to create a test watchlist
    const watchlist = await DatabaseService.createWatchlist(user.id, 'Test Watchlist')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and operations successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        watchlist: {
          id: watchlist.id,
          name: watchlist.name,
          itemCount: watchlist.items.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
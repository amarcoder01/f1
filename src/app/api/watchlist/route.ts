import { NextRequest, NextResponse } from 'next/server'
import { withAuth, createAuthenticatedResponse, createErrorResponse } from '@/lib/auth-middleware'
import { DatabaseService } from '@/lib/db'

async function getWatchlistsHandler(request: NextRequest) {
  try {
    // User is already authenticated by the middleware
    const user = (request as any).user
    
    if (!user || !user.id) {
      return createErrorResponse('User not found', 401)
    }

    console.log('🔍 API: Getting watchlists for user:', user.id)
    
    const watchlists = await DatabaseService.getWatchlists(user.id)
    
    console.log('✅ API: Successfully retrieved watchlists:', watchlists.length)
    
    return createAuthenticatedResponse({
      success: true,
      data: watchlists
    })
    
  } catch (error) {
    console.error('❌ API: Error getting watchlists:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Engine is not yet connected')) {
        return createErrorResponse(
          'Database service is starting up. Please try again in a moment.',
          503
        )
      }
      
      return createErrorResponse(error.message, 500)
    }
    
    return createErrorResponse('Failed to retrieve watchlists', 500)
  }
}

// POST - Create a new watchlist
async function createWatchlistHandler(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    console.log(`🔍 API: Creating watchlist "${name}"...`)
    
    // User is already authenticated by the middleware
    const user = (request as any).user
    
    if (!user || !user.id) {
      return createErrorResponse('User not found', 401)
    }

    // Create the watchlist
    const watchlist = await DatabaseService.createWatchlist(user.id, name || 'My Watchlist')
    
    console.log(`✅ Database: Created watchlist "${name}" for user ${user.id}`)
    return createAuthenticatedResponse({
      success: true,
      data: watchlist
    })
  } catch (error) {
    console.error('❌ Error creating watchlist:', error)
    return createErrorResponse('Failed to create watchlist', 500)
  }
}

// Export the handlers wrapped with authentication
export const GET = withAuth(getWatchlistsHandler)
export const POST = withAuth(createWatchlistHandler) 
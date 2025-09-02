import { NextRequest, NextResponse } from 'next/server'

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY

interface MarketStatus {
  market: string
  serverTime: string
}

async function makePolygonRequest(endpoint: string): Promise<any> {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon API key is not configured')
  }

  const url = `https://api.polygon.io${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${POLYGON_API_KEY}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Polygon.io API key configuration.')
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your Polygon.io subscription plan.')
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'ERROR') {
      throw new Error(data.error || 'API returned an error')
    }
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error occurred while fetching data')
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!POLYGON_API_KEY) {
      return NextResponse.json(
        { error: 'Polygon API key is not configured' },
        { status: 500 }
      )
    }

    // Get market status from Polygon API
    const marketStatusResponse = await makePolygonRequest('/v1/marketstatus/now')
    
    // Use the actual market status from Polygon API
    const marketStatus: MarketStatus = {
      market: marketStatusResponse.market || 'closed',
      serverTime: marketStatusResponse.serverTime || new Date().toISOString()
    }

    return NextResponse.json(marketStatus)
  } catch (error) {
    console.error('Error fetching market status:', error)
    
    // Return error response instead of fallback
    return NextResponse.json(
      { error: 'Failed to fetch market status' },
      { status: 500 }
    )
  }
}

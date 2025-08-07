// Test route to verify Polygon.io API is working
import { NextResponse } from 'next/server'

const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const POLYGON_BASE_URL = 'https://api.polygon.io'

export async function GET() {
  try {
    // Check if API key is available
    if (!POLYGON_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Polygon API key not configured',
        error: 'POLYGON_API_KEY environment variable is missing'
      }, { status: 500 })
    }

    // Test with a simple API call to get AAPL data
    const testUrl = `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apikey=${POLYGON_API_KEY}`
    
    console.log('Testing Polygon API with AAPL...')
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    if (response.ok && data.results && data.results.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Polygon.io API is working!',
        testData: {
          symbol: 'AAPL',
          price: data.results[0]?.value?.day?.c || data.results[0]?.value?.prevDay?.c,
          status: data.status
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Polygon.io API call failed',
        error: data,
        status: response.status
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error testing Polygon.io API',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
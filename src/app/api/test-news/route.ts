import { NextRequest, NextResponse } from 'next/server'

const NEWS_API_KEY = 'e1ea318668a84a58bb26d1c155813b03'
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing NewsAPI integration...')
    
    // Test 1: Check API key validity with a simple request
    const testUrl = `${NEWS_API_BASE_URL}/top-headlines?country=us&category=business&apiKey=${NEWS_API_KEY}&pageSize=1`
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    if (data.status === 'ok') {
      console.log('✅ NewsAPI connection successful')
      return NextResponse.json({
        success: true,
        message: 'NewsAPI integration working correctly',
        testData: {
          status: data.status,
          totalResults: data.totalResults,
          sampleArticle: data.articles[0] ? {
            title: data.articles[0].title,
            source: data.articles[0].source.name,
            publishedAt: data.articles[0].publishedAt
          } : null
        },
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ NewsAPI error:', data)
      return NextResponse.json({
        success: false,
        message: 'NewsAPI returned an error',
        error: data,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ NewsAPI test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'NewsAPI test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

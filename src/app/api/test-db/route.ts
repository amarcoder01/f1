import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    const isConnected = await DatabaseService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        fallback: 'in-memory'
      })
    }
    
    // Try to get or create demo user
    try {
      const user = await DatabaseService.getOrCreateDemoUser()
      console.log('✅ Demo user created/found:', user.id)
      
      return NextResponse.json({
        success: true,
        message: 'Database is working',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })
    } catch (userError) {
      console.error('❌ Error with demo user:', userError)
      return NextResponse.json({
        success: false,
        message: 'Database connected but user creation failed',
        error: userError instanceof Error ? userError.message : 'Unknown error'
      })
    }
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

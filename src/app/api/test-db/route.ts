import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Test DB API - Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Test DB API - Database connected successfully')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log('✅ Test DB API - User count:', userCount)
    
    // Test portfolio table
    const portfolioCount = await prisma.portfolio.count()
    console.log('✅ Test DB API - Portfolio count:', portfolioCount)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        portfolioCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Test DB API - Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
      console.log('🔌 Test DB API - Database disconnected')
    } catch (disconnectError) {
      console.error('❌ Test DB API - Failed to disconnect:', disconnectError)
    }
  }
}

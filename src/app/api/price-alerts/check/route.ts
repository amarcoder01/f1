import { NextRequest, NextResponse } from 'next/server'
import { PriceAlertService } from '@/lib/price-alert-service'

// POST /api/price-alerts/check - Manually trigger price alert check
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Manual price alert check triggered')
    
    // Check all active alerts
    await PriceAlertService.checkAllAlerts()
    
    // Get statistics
    const stats = await PriceAlertService.getAlertStats()
    
    return NextResponse.json({
      success: true,
      message: 'Price alert check completed successfully',
      stats
    })
  } catch (error) {
    console.error('❌ Error in manual price alert check:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check price alerts' },
      { status: 500 }
    )
  }
}

// GET /api/price-alerts/check - Get price alert statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await PriceAlertService.getAlertStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('❌ Error getting price alert stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get price alert statistics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { priceAlertScheduler } from '@/lib/price-alert-scheduler'

// GET /api/price-alerts/scheduler - Get scheduler status
export async function GET(request: NextRequest) {
  try {
    const status = {
      isActive: priceAlertScheduler.isActive(),
      intervalSeconds: priceAlertScheduler.getIntervalSeconds(),
      nextCheckTime: priceAlertScheduler.getNextCheckTime().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error getting scheduler status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get scheduler status' },
      { status: 500 }
    )
  }
}

// POST /api/price-alerts/scheduler - Start/stop scheduler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "start" or "stop"' },
        { status: 400 }
      )
    }

    if (action === 'start') {
      priceAlertScheduler.start()
    } else {
      priceAlertScheduler.stop()
    }

    const status = {
      isActive: priceAlertScheduler.isActive(),
      intervalSeconds: priceAlertScheduler.getIntervalSeconds(),
      nextCheckTime: priceAlertScheduler.getNextCheckTime().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: `Scheduler ${action}ed successfully`,
      data: status
    })
  } catch (error) {
    console.error('Error managing scheduler:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to manage scheduler' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DatabaseService } from '@/lib/db'

const prisma = new PrismaClient()

// GET /api/price-alerts/[id]/history - Get history for a specific price alert
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await DatabaseService.getOrCreateDemoUser()
    
    // Check if alert exists and belongs to user
    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!alert) {
      return NextResponse.json(
        { success: false, message: 'Price alert not found' },
        { status: 404 }
      )
    }

    // Get history entries
    const history = await prisma.priceAlertHistory.findMany({
      where: {
        alertId: params.id
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: history.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching price alert history:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch price alert history' },
      { status: 500 }
    )
  }
}

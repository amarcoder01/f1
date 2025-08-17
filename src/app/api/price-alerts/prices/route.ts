import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DatabaseService } from '@/lib/db'
import { PriceAlertService } from '@/lib/price-alert-service'

const prisma = new PrismaClient()

// GET /api/price-alerts/prices - Get current prices for all active alerts
export async function GET(request: NextRequest) {
  try {
    // Get demo user (in production, this would be from authentication)
    const user = await DatabaseService.getOrCreateDemoUser()
    
    // Get all active alerts for the user
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        userId: user.id,
        status: 'active',
        isActive: true
      },
      select: {
        id: true,
        symbol: true,
        targetPrice: true,
        condition: true
      }
    })

    // Extract unique symbols
    const symbols = Array.from(new Set(activeAlerts.map(alert => alert.symbol)))
    
    // Get current prices for all symbols
    const currentPrices = await PriceAlertService.getCurrentPrices(symbols)

    // Combine alert data with current prices
    const alertsWithPrices = activeAlerts.map(alert => {
      const priceData = currentPrices[alert.symbol]
      return {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        currentPrice: priceData?.price || null,
        priceChange: priceData?.change || null,
        priceChangePercent: priceData?.changePercent || null,
        name: priceData?.name || null,
        lastUpdated: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: alertsWithPrices
    })
  } catch (error) {
    console.error('Error fetching current prices:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch current prices' },
      { status: 500 }
    )
  }
}

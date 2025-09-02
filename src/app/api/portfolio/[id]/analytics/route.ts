import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth-service'

// GET - Get portfolio analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('API: Loading analytics for portfolio:', id)

    // Verify user has access to this portfolio
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Get all positions and trades
    const [positions, trades] = await Promise.all([
      prisma.position.findMany({
        where: { portfolioId: id },
        orderBy: { entryDate: 'desc' }
      }),
      prisma.trade.findMany({
        where: { portfolioId: id },
        orderBy: { date: 'desc' }
      })
    ])

    // Calculate basic analytics
    const totalPositions = positions.length
    const totalTrades = trades.length
    const buyTrades = trades.filter(t => t.type === 'buy')
    const sellTrades = trades.filter(t => t.type === 'sell')

    // Calculate total invested and current value (simplified - would need real-time data)
    const totalInvested = positions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0)
    
    // Calculate trade statistics
    const totalBuyAmount = buyTrades.reduce((sum, trade) => sum + trade.amount, 0)
    const totalSellAmount = sellTrades.reduce((sum, trade) => sum + trade.amount, 0)
    const netCashFlow = totalSellAmount - totalBuyAmount

    // Calculate position statistics
    const positionStats = positions.map(pos => ({
      symbol: pos.symbol,
      quantity: pos.quantity,
      averagePrice: pos.averagePrice,
      totalCost: pos.quantity * pos.averagePrice,
      percentageOfPortfolio: totalInvested > 0 ? ((pos.quantity * pos.averagePrice) / totalInvested) * 100 : 0
    }))

    // Sort positions by value
    positionStats.sort((a, b) => b.totalCost - a.totalCost)

    // Calculate trade performance
    const tradePerformance = trades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price,
      amount: trade.amount,
      date: trade.date,
      notes: trade.notes
    }))

    // Calculate monthly performance (simplified)
    const monthlyTrades = trades.reduce((acc, trade) => {
      const month = new Date(trade.date).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { buys: 0, sells: 0, net: 0 }
      }
      if (trade.type === 'buy') {
        acc[month].buys += trade.amount
      } else {
        acc[month].sells += trade.amount
      }
      acc[month].net = acc[month].sells - acc[month].buys
      return acc
    }, {} as Record<string, { buys: number; sells: number; net: number }>)

    const analytics = {
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt
      },
      summary: {
        totalPositions,
        totalTrades,
        buyTrades: buyTrades.length,
        sellTrades: sellTrades.length,
        totalInvested,
        totalBuyAmount,
        totalSellAmount,
        netCashFlow
      },
      positions: positionStats,
      trades: tradePerformance,
      monthlyPerformance: monthlyTrades,
      topHoldings: positionStats.slice(0, 5), // Top 5 positions by value
      recentTrades: tradePerformance.slice(0, 10) // Last 10 trades
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('API: Error loading analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load analytics'
    }, { status: 500 })
  }
}

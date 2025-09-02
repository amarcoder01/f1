import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth-service'

// GET - Get all trades for a portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('API: Loading trades for portfolio:', id)

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

    const trades = await prisma.trade.findMany({
      where: { portfolioId: id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: trades
    })

  } catch (error) {
    console.error('API: Error loading trades:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load trades'
    }, { status: 500 })
  }
}

// POST - Create a new trade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { symbol, type, quantity, price, notes } = body

    // Validate required fields
    if (!symbol || !type || !quantity || !price) {
      return NextResponse.json({
        success: false,
        error: 'Symbol, type, quantity, and price are required'
      }, { status: 400 })
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Trade type must be either "buy" or "sell"'
      }, { status: 400 })
    }

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

    // For sell trades, check if user has enough shares
    if (type === 'sell') {
      const currentPosition = await prisma.position.findFirst({
        where: { 
          portfolioId: id,
          symbol: symbol.toUpperCase()
        }
      })

      if (!currentPosition || currentPosition.quantity < quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient shares. You only own ${currentPosition?.quantity || 0} shares of ${symbol.toUpperCase()}`
        }, { status: 400 })
      }
    }

    console.log('API: Creating trade:', { symbol, type, quantity, price })

    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        portfolioId: id,
        symbol: symbol.toUpperCase(),
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        amount: parseFloat(quantity) * parseFloat(price),
        date: new Date(),
        notes: notes || null
      }
    })

    // Update or create position based on trade type
    if (type === 'buy') {
      // Check if position already exists
      const existingPosition = await prisma.position.findFirst({
        where: { 
          portfolioId: id,
          symbol: symbol.toUpperCase()
        }
      })

      if (existingPosition) {
        // Update existing position (average down/up)
        const totalQuantity = existingPosition.quantity + parseFloat(quantity)
        const totalCost = (existingPosition.quantity * existingPosition.averagePrice) + (parseFloat(quantity) * parseFloat(price))
        const newAveragePrice = totalCost / totalQuantity

        await prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: totalQuantity,
            averagePrice: newAveragePrice,
            entryDate: new Date()
          }
        })
      } else {
        // Create new position
        await prisma.position.create({
          data: {
            portfolioId: id,
            symbol: symbol.toUpperCase(),
            quantity: parseFloat(quantity),
            averagePrice: parseFloat(price),
            entryDate: new Date(),
            notes: notes || null
          }
        })
      }
    } else if (type === 'sell') {
      // Update position by reducing quantity
      const existingPosition = await prisma.position.findFirst({
        where: { 
          portfolioId: id,
          symbol: symbol.toUpperCase()
        }
      })

      if (existingPosition) {
        const remainingQuantity = existingPosition.quantity - parseFloat(quantity)
        
        if (remainingQuantity <= 0) {
          // Delete position if all shares sold
          await prisma.position.delete({
            where: { id: existingPosition.id }
          })
        } else {
          // Update position with remaining quantity
          await prisma.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: remainingQuantity
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: trade
    })

  } catch (error) {
    console.error('API: Error creating trade:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create trade'
    }, { status: 500 })
  }
}

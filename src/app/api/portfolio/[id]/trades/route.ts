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
    console.log('🔍 Trades API - Loading trades for portfolio:', id)

    // Verify user has access to this portfolio
    const token = request.cookies.get('token')?.value
    if (!token) {
      console.log('❌ Trades API - No token provided')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔐 Trades API - Verifying token...')
    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      console.log('❌ Trades API - Invalid authentication token')
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    console.log('👤 Trades API - User verified:', { userId: user.id, userEmail: user.email })

    // Test database connection
    console.log('🔌 Trades API - Testing database connection...')
    try {
      await prisma.$connect()
      console.log('✅ Trades API - Database connection successful')
    } catch (dbError) {
      console.error('❌ Trades API - Database connection failed:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Verify portfolio belongs to user
    console.log('📊 Trades API - Verifying portfolio ownership...')
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })

    if (!portfolio) {
      console.log('❌ Trades API - Portfolio not found or access denied:', { portfolioId: id, userId: user.id })
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    console.log('✅ Trades API - Portfolio access verified:', { portfolioId: portfolio.id, portfolioName: portfolio.name })

    // Fetch trades
    console.log('📈 Trades API - Fetching trades...')
    const trades = await prisma.trade.findMany({
      where: { portfolioId: id },
      orderBy: { date: 'desc' }
    })

    console.log('✅ Trades API - Trades fetched successfully:', { count: trades.length })

    return NextResponse.json({
      success: true,
      data: trades
    })

  } catch (error) {
    console.error('❌ Trades API - Error loading trades:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to load trades'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        errorMessage = 'Database connection error. Please try again later.'
        statusCode = 503
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        errorMessage = 'Authentication error. Please log in again.'
        statusCode = 401
      } else if (error.message.includes('portfolio') || error.message.includes('not found')) {
        errorMessage = 'Portfolio not found.'
        statusCode = 404
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode })
  } finally {
    // Always disconnect from database
    try {
      await prisma.$disconnect()
      console.log('🔌 Trades API - Database disconnected')
    } catch (disconnectError) {
      console.warn('⚠️ Trades API - Error disconnecting from database:', disconnectError)
    }
  }
}

// POST - Create a new trade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📝 Trades API - Creating new trade for portfolio:', id)
    
    const body = await request.json()
    const { symbol, type, quantity, price, notes } = body

    console.log('📊 Trades API - Trade data received:', { symbol, type, quantity, price, notes })

    // Validate required fields
    if (!symbol || !type || !quantity || !price) {
      console.log('❌ Trades API - Missing required fields:', { symbol, type, quantity, price })
      return NextResponse.json({
        success: false,
        error: 'Symbol, type, quantity, and price are required'
      }, { status: 400 })
    }

    if (!['buy', 'sell'].includes(type)) {
      console.log('❌ Trades API - Invalid trade type:', type)
      return NextResponse.json({
        success: false,
        error: 'Trade type must be either "buy" or "sell"'
      }, { status: 400 })
    }

    // Verify user has access to this portfolio
    const token = request.cookies.get('token')?.value
    if (!token) {
      console.log('❌ Trades API - No token provided for trade creation')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔐 Trades API - Verifying token for trade creation...')
    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      console.log('❌ Trades API - Invalid authentication token for trade creation')
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    console.log('👤 Trades API - User verified for trade creation:', { userId: user.id, userEmail: user.email })

    // Test database connection
    console.log('🔌 Trades API - Testing database connection for trade creation...')
    try {
      await prisma.$connect()
      console.log('✅ Trades API - Database connection successful for trade creation')
    } catch (dbError) {
      console.error('❌ Trades API - Database connection failed for trade creation:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Verify portfolio belongs to user
    console.log('📊 Trades API - Verifying portfolio ownership for trade creation...')
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })

    if (!portfolio) {
      console.log('❌ Trades API - Portfolio not found or access denied for trade creation:', { portfolioId: id, userId: user.id })
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    console.log('✅ Trades API - Portfolio access verified for trade creation:', { portfolioId: portfolio.id, portfolioName: portfolio.name })

    // For sell trades, check if user has enough shares
    if (type === 'sell') {
      console.log('📉 Trades API - Checking position for sell trade...')
      const currentPosition = await prisma.position.findFirst({
        where: { 
          portfolioId: id,
          symbol: symbol.toUpperCase()
        }
      })

      if (!currentPosition || currentPosition.quantity < quantity) {
        console.log('❌ Trades API - Insufficient shares for sell trade:', { 
          symbol, 
          requestedQuantity: quantity, 
          availableQuantity: currentPosition?.quantity || 0 
        })
        return NextResponse.json({
          success: false,
          error: `Insufficient shares. You only own ${currentPosition?.quantity || 0} shares of ${symbol.toUpperCase()}`
        }, { status: 400 })
      }

      console.log('✅ Trades API - Position check passed for sell trade:', { 
        symbol, 
        availableQuantity: currentPosition.quantity 
      })
    }

    console.log('📝 Trades API - Creating trade:', { symbol, type, quantity, price })

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

    console.log('✅ Trades API - Trade created successfully:', { tradeId: trade.id, symbol, type, quantity, price })

    // Update or create position based on trade type
    if (type === 'buy') {
      console.log('📈 Trades API - Processing buy trade position update...')
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

        console.log('✅ Trades API - Existing position updated:', { 
          positionId: existingPosition.id, 
          newQuantity: totalQuantity, 
          newAveragePrice: newAveragePrice 
        })
      } else {
        // Create new position
        const newPosition = await prisma.position.create({
          data: {
            portfolioId: id,
            symbol: symbol.toUpperCase(),
            quantity: parseFloat(quantity),
            averagePrice: parseFloat(price),
            entryDate: new Date(),
            notes: notes || null
          }
        })

        console.log('✅ Trades API - New position created:', { 
          positionId: newPosition.id, 
          symbol, 
          quantity: parseFloat(quantity), 
          averagePrice: parseFloat(price) 
        })
      }
    } else if (type === 'sell') {
      console.log('📉 Trades API - Processing sell trade position update...')
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

          console.log('✅ Trades API - Position deleted (all shares sold):', { 
            positionId: existingPosition.id, 
            symbol 
          })
        } else {
          // Update position with remaining quantity
          await prisma.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: remainingQuantity
            }
          })

          console.log('✅ Trades API - Position updated (partial sell):', { 
            positionId: existingPosition.id, 
            symbol, 
            remainingQuantity 
          })
        }
      }
    }

    console.log('✅ Trades API - Trade and position processing completed successfully')

    return NextResponse.json({
      success: true,
      data: trade
    })

  } catch (error) {
    console.error('❌ Trades API - Error creating trade:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create trade'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        errorMessage = 'Database connection error. Please try again later.'
        statusCode = 503
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        errorMessage = 'Authentication error. Please log in again.'
        statusCode = 401
      } else if (error.message.includes('portfolio') || error.message.includes('not found')) {
        errorMessage = 'Portfolio not found.'
        statusCode = 404
      } else if (error.message.includes('insufficient') || error.message.includes('shares')) {
        errorMessage = error.message
        statusCode = 400
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode })
  } finally {
    // Always disconnect from database
    try {
      await prisma.$disconnect()
      console.log('🔌 Trades API - Database disconnected')
    } catch (disconnectError) {
      console.warn('⚠️ Trades API - Error disconnecting from database:', disconnectError)
    }
  }
}

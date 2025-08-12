import { NextRequest, NextResponse } from 'next/server'
import { PaperTradingService } from '@/lib/paper-trading'
import { DatabaseService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get demo user for now (in production, use real authentication)
    const user = await DatabaseService.getOrCreateDemoUser()
    
    const accounts = await PaperTradingService.getAccounts(user.id)
    
    return NextResponse.json({
      success: true,
      data: accounts,
    })
  } catch (error) {
    console.error('Error fetching paper trading accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch paper trading accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, initialBalance = 100000 } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Account name is required' },
        { status: 400 }
      )
    }

    // Get demo user for now (in production, use real authentication)
    const user = await DatabaseService.getOrCreateDemoUser()
    
    const account = await PaperTradingService.createAccount(user.id, name, initialBalance)
    
    return NextResponse.json({
      success: true,
      data: account,
    })
  } catch (error) {
    console.error('Error creating paper trading account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create paper trading account' },
      { status: 500 }
    )
  }
}

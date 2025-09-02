import { NextRequest, NextResponse } from 'next/server'
import { UserDataService } from '@/lib/user-data-service'

export async function GET(request: NextRequest) {
  try {
    const sessions = await UserDataService.getStockComparisonSessions()
    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session } = body

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session data is required' },
        { status: 400 }
      )
    }

    const updatedSessions = await UserDataService.saveStockComparisonSession(session)
    return NextResponse.json({ success: true, sessions: updatedSessions })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save session' },
      { status: 500 }
    )
  }
}

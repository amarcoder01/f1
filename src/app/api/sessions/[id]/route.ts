import { NextRequest, NextResponse } from 'next/server'
import { UserDataService } from '@/lib/user-data-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get current sessions
    const currentSessions = await UserDataService.getStockComparisonSessions()
    
    // Remove the session with the specified ID
    const updatedSessions = currentSessions.filter((session: any) => session.id !== id)
    
    // Save the updated sessions back to the database
    const result = await UserDataService.saveStockComparisonSession({ 
      id, 
      deleted: true,
      sessions: updatedSessions 
    })
    
    return NextResponse.json({ success: true, sessions: result })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

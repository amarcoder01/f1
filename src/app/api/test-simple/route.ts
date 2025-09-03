import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Simple API is working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Simple API failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

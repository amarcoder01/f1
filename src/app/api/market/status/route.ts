import { NextRequest, NextResponse } from 'next/server'
import { polygonAPI } from '@/lib/polygon-api'

export async function GET(request: NextRequest) {
  try {
    // Get market status from Polygon.io
    const marketStatus = await polygonAPI.getMarketStatus()
    
    return NextResponse.json({
      isOpen: marketStatus.isOpen,
      nextOpen: marketStatus.nextOpen,
      nextClose: marketStatus.nextClose,
      lastUpdated: new Date().toISOString(),
      isRealTime: marketStatus.isOpen
    })
  } catch (error) {
    console.error('Error fetching market status:', error)
    
    // Fallback: estimate market status based on time
    const now = new Date()
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
    const day = etTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = etTime.getHours()
    const minute = etTime.getMinutes()
    const timeInMinutes = hour * 60 + minute
    
    const isMarketOpen = day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes < 960 // 9:30 AM to 4:00 PM ET
    
    return NextResponse.json({
      isOpen: isMarketOpen,
      nextOpen: null,
      nextClose: null,
      lastUpdated: new Date().toISOString(),
      isRealTime: isMarketOpen,
      error: 'Using fallback market status'
    })
  }
}

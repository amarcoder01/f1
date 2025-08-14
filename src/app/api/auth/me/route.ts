import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { findUserById } from '@/lib/auth-db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    // Extract token
    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    
    // Find user
    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data
    return NextResponse.json({
      user
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    )
  }
}

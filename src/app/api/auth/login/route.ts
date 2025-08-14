import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getUserWithPassword, verifyPassword, updateLastLogin } from '@/lib/auth-db'
import { authRateLimiter } from '@/lib/rate-limiter'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `login:${clientIP}:${email.toLowerCase()}`
    
    if (!authRateLimiter.isAllowed(rateLimitKey)) {
      const remainingTime = authRateLimiter.getRemainingTime(rateLimitKey)
      return NextResponse.json(
        { 
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil(remainingTime / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(remainingTime / 1000).toString()
          }
        }
      )
    }

    // Find user with password
    const userData = await getUserWithPassword(email)
    if (!userData) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await updateLastLogin(userData.user.id)

    // Reset rate limit on successful login
    authRateLimiter.reset(rateLimitKey)

    // Create JWT token
    const token = jwt.sign(
      { userId: userData.user.id, email: userData.user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        ...userData.user,
        lastLoginAt: userData.user.lastLoginAt?.toISOString() || new Date().toISOString()
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { findUserByEmail, verifyPassword } from '@/lib/auth-storage'
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

    // Find user
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset rate limit on successful login
    authRateLimiter.reset(rateLimitKey)

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        lastLoginAt: new Date().toISOString()
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

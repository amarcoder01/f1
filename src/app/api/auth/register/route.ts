import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { findUserByEmail, createUser, hashPassword } from '@/lib/auth-storage'
import { registerRateLimiter } from '@/lib/rate-limiter'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `register:${clientIP}`
    
    if (!registerRateLimiter.isAllowed(rateLimitKey)) {
      const remainingTime = registerRateLimiter.getRemainingTime(rateLimitKey)
      return NextResponse.json(
        { 
          message: 'Too many registration attempts. Please try again later.',
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

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check for password complexity
    if (!/(?=.*[a-z])/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      )
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }

    if (!/(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one number' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate names
    if (!firstName.trim() || firstName.trim().length < 2) {
      return NextResponse.json(
        { message: 'First name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      return NextResponse.json(
        { message: 'Last name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Validate name format (only letters and spaces)
    if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
      return NextResponse.json(
        { message: 'First name can only contain letters and spaces' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z\s]+$/.test(lastName.trim())) {
      return NextResponse.json(
        { message: 'Last name can only contain letters and spaces' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      isEmailVerified: false,
      preferences: {
        theme: 'system',
        currency: 'USD',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        lastLoginAt: new Date().toISOString()
      },
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

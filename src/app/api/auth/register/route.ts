import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth-security'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('JSON parsing failed:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, privacyPolicyAccepted } = body

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      const response = NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
      
      // Clear any existing auth cookies
      response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' })
      response.cookies.set('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' })
      
      return response
    }

    // Validate privacy policy acceptance
    if (!privacyPolicyAccepted) {
      const response = NextResponse.json(
        { success: false, error: 'You must accept the Privacy Policy to continue' },
        { status: 400 }
      )
      
      // Clear any existing auth cookies
      response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' })
      response.cookies.set('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' })
      
      return response
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      // Create response for existing user error
      const response = NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
      
      // Clear any existing auth cookies to prevent authentication confusion
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
      })
      
      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
      })
      
      return response
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isEmailVerified: false,
        isAccountLocked: false,
        isAccountDisabled: false,
        failedLoginAttempts: 0,
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date(),
        preferences: JSON.stringify({
          theme: 'system',
          currency: 'USD',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          security: {
            mfaEnabled: false,
            trustedDevices: [],
            lastPasswordChange: new Date().toISOString()
          }
        })
      }
    })

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Create success response
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        accessToken,
        message: 'Account created successfully'
      }
    }, { status: 201 })

    // Set cookies
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

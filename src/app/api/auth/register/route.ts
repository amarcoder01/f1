import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { AuthError, AuthErrorType } from '@/lib/auth-security'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { 
          message: 'All fields are required',
          type: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Enhanced user creation with comprehensive security
    const user = await AuthService.createUser({ email, password, firstName, lastName }, request)

    // Generate tokens for new user
    const { accessToken, refreshToken } = await AuthService.loginUser(email, password, request)

    // Set secure HTTP-only cookies
    const response = NextResponse.json({
      user: {
        ...user,
        lastLoginAt: new Date().toISOString()
      },
      accessToken,
      message: 'Account created successfully'
    }, { status: 201 })

    // Set refresh token as HTTP-only cookie
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

    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          message: error.message,
          type: error.type,
          details: error.details
        },
        { status: error.code }
      )
    }

    return NextResponse.json(
      { 
        message: 'An unexpected error occurred during registration',
        type: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { AuthError, AuthErrorType } from '@/lib/auth-security'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          message: 'Email and password are required',
          type: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Enhanced login with comprehensive security
    const result = await AuthService.loginUser(email, password, request)

    // Set secure HTTP-only cookies
    const response = NextResponse.json({
      user: result.user,
      accessToken: result.accessToken,
      requiresMFA: result.requiresMFA,
      suspiciousActivity: result.suspiciousActivity,
      suspiciousReasons: result.suspiciousReasons
    })

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof AuthError) {
      const response = NextResponse.json(
        { 
          message: error.message,
          type: error.type,
          details: error.details
        },
        { status: error.code }
      )

      // Add retry-after header for rate limiting
      if (error.retryAfter) {
        response.headers.set('Retry-After', error.retryAfter.toString())
      }

      return response
    }

    return NextResponse.json(
      { 
        message: 'An unexpected error occurred during login',
        type: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

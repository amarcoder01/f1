import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.polygon.io https://api.twilio.com https://api.sendgrid.com",
    "frame-ancestors 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // Prevent caching for sensitive routes
  if (request.nextUrl.pathname.startsWith('/api/auth/') || 
      request.nextUrl.pathname.startsWith('/api/user/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Authentication check for protected API routes
  const protectedRoutes = [
    '/api/user/',
    '/api/watchlist/',
    '/api/paper-trading/',
    '/api/price-alerts/'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    // Allow requests with valid tokens or refresh tokens
    if (!token && !refreshToken) {
      // For watchlist routes, allow demo access
      if (request.nextUrl.pathname.startsWith('/api/watchlist/')) {
        // Continue with demo user access
        return response
      }
      
      // For other protected routes, return 401
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

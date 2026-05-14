import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const teamId = request.cookies.get('team_id')?.value

  // Protect /play/* routes
  if (pathname.startsWith('/play')) {
    if (!teamId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect /admin/* routes — checked via GM_EMAILS in the admin layout
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from login
  if (pathname === '/login' && teamId) {
    return NextResponse.redirect(new URL('/play', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/play/:path*', '/admin/:path*', '/login'],
}

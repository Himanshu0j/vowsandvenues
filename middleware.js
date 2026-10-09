import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // 1. Host-based Subdomain Routing for admin.vowsandvenues.in
  // Prepares the platform for https://admin.vowsandvenues.in/ binding (Phase 3)
  if (host.startsWith('admin.') && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
    url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`
    return NextResponse.rewrite(url)
  }

  const response = NextResponse.next()

  // 2. Staging Search Engine Isolation (Phase 2 & Phase 11)
  const isStaging =
    process.env.APP_ENV === 'staging' ||
    host.includes('onrender.com') ||
    host.includes('staging') ||
    host.includes('localhost')

  if (isStaging) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  }

  // 3. Essential Security Headers (Phase 18)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

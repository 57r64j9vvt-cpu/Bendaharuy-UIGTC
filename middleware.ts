import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')
    const { pathname } = request.nextUrl

    // Allow access to login page and static assets
    if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        // If user is already logged in and tries to access login, redirect to home
        if (pathname.startsWith('/login') && token?.value === 'authenticated') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // Protect other routes
    if (!token || token.value !== 'authenticated') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

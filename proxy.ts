import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { isAuthEnabled } from '@/lib/features'

const PUBLIC_PATHS = ['/', '/favicon.ico']
const PUBLIC_PREFIXES = ['/training/', '/codelab/', '/api/auth/', '/_next/']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function proxy(request: NextRequest) {
  if (!isAuthEnabled()) return NextResponse.next()

  const { pathname, search } = request.nextUrl
  if (isPublicPath(pathname) || !pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const session = await auth(request)
  if (session?.user) return NextResponse.next()

  const signInUrl = new URL('/api/auth/signin', request.url)
  signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

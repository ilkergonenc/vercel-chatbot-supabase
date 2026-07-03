import { type NextRequest, NextResponse } from 'next/server'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 })
  }

  if (pathname.startsWith('/api/auth/guest')) {
    return NextResponse.next()
  }

  const { response, user } = await updateSupabaseSession(request)

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

  if (!user) {
    const redirectUrl = encodeURIComponent(new URL(request.url).pathname)

    return NextResponse.redirect(
      new URL(`${base}/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    )
  }

  if (!user.is_anonymous && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL(`${base}/`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',

    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

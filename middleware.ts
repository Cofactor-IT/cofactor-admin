/**
 * middleware.ts
 *
 * Session guard for protected Admin routes.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

function isPublicPath(pathname: string): boolean {
  return pathname.startsWith("/auth/") || pathname.startsWith("/api/auth/")
}

/**
 * Redirects unauthenticated users to sign-in for protected routes.
 *
 * @param request - Incoming edge request
 * @returns Next response or redirect
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (token) {
    return NextResponse.next()
  }

  const signInUrl = new URL("/auth/signin", request.url)
  signInUrl.searchParams.set("callbackUrl", pathname)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

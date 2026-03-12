/**
 * proxy.ts
 *
 * Session guard for protected Admin routes.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATHS = new Set(["/auth/signin", "/auth/forgot-password", "/auth/reset-password"])
const IT_ONLY_PATH_PREFIXES = ["/settings", "/auth/signup"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/api/auth/")
}

function isITOnlyPath(pathname: string): boolean {
  return IT_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Redirects unauthenticated users to sign-in and enforces IT-only routes.
 *
 * @param request - Incoming edge request
 * @returns Next response or redirect
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(signInUrl)
  }

  if (isITOnlyPath(pathname) && token.role !== "IT") {
    return NextResponse.redirect(new URL("/submissions", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

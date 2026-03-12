/**
 * session.ts
 *
 * Session utilities for server-side auth checks.
 */

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "./config"

/**
 * Retrieves the current server session using shared auth config.
 *
 * @returns Session object or null when unauthenticated
 */
export function getCurrentSession() {
  return getServerSession(authConfig)
}

/**
 * Requires an authenticated user session or redirects to sign-in.
 *
 * @returns Authenticated session containing user identity claims
 */
export async function requireAuthSession() {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    redirect("/signin")
  }

  return session
}

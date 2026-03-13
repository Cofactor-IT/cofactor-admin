"use client"

/**
 * SignOutButton.tsx
 *
 * Sign-out trigger that logs audit action before destroying session.
 */

import { useState } from "react"
import { signOut } from "next-auth/react"
import { logSignOutAuditAction } from "../../actions/session.actions"

async function clearClientAuthState() {
  sessionStorage.removeItem("cofactor-admin-ui-state")
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-nav-icon">
      <path d="M8 4.5H5.75A1.75 1.75 0 0 0 4 6.25v7.5c0 .97.78 1.75 1.75 1.75H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.5 13.5 14.5 10l-4-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Renders authenticated sign-out button.
 *
 * @returns Button that logs sign-out and clears NextAuth session cookie
 */
export function SignOutButton() {
  const [isPending, setIsPending] = useState(false)

  async function handleSignOut() {
    setIsPending(true)
    await clearClientAuthState()
    await logSignOutAuditAction().catch(() => undefined)
    await signOut({ callbackUrl: "/signin" })
    setIsPending(false)
  }

  return (
    <button type="button" className="admin-sidebar-signout" disabled={isPending} onClick={handleSignOut}>
      <SignOutIcon />
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  )
}

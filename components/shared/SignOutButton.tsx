"use client"

/**
 * SignOutButton.tsx
 *
 * Sign-out trigger that logs audit action before destroying session.
 */

import { useState } from "react"
import { signOut } from "next-auth/react"
import { logSignOutAuditAction } from "../../actions/session.actions"
import { Button } from "../ui/Button"

async function clearClientAuthState() {
  sessionStorage.removeItem("cofactor-admin-ui-state")
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
    await signOut({ callbackUrl: "/auth/signin" })
    setIsPending(false)
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full justify-center"
      disabled={isPending}
      onClick={handleSignOut}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  )
}

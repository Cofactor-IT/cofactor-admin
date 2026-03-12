"use client"

/**
 * ResetPasswordForm.tsx
 *
 * Client form for completing token-based password reset.
 */

import { useActionState } from "react"
import { resetPassword, type ResetPasswordActionState } from "../../../actions/password-reset.actions"
import { Button } from "../../../components/ui/Button"
import { TextButton } from "../../../components/ui/TextButton"

const INITIAL_STATE: ResetPasswordActionState = {
  success: false,
  message: "",
}

interface ResetPasswordFormProps {
  token?: string
}

function firstFieldError(state: ResetPasswordActionState, field: string): string | null {
  return state.fieldErrors?.[field]?.[0] ?? null
}

function hasFieldError(state: ResetPasswordActionState, field: string): boolean {
  return Boolean(firstFieldError(state, field))
}

/**
 * Renders reset-password form UI for a specific token.
 *
 * @param props - Reset token from URL query
 * @returns Form UI or invalid-token fallback
 */
export function ResetPasswordForm(props: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, INITIAL_STATE)

  if (!props.token) {
    return (
      <div className="admin-card admin-auth-form">
        <h1 className="m-0">Reset Password</h1>
        <p className="caption admin-field-error">Reset link is invalid or missing a token.</p>
        <TextButton href="/auth/forgot-password">Request a new reset link</TextButton>
      </div>
    )
  }

  return (
    <form action={formAction} className="admin-card admin-auth-form admin-auth-form-wide">
      <h1 className="m-0">Reset Password</h1>
      <p className="body m-0">Choose a new password for your @cofactor.world account.</p>
      <input type="hidden" name="token" value={props.token} />

      <label className={`label${hasFieldError(state, "password") ? " admin-field-error" : ""}`} htmlFor="password">
        New password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className={`admin-input${hasFieldError(state, "password") ? " admin-input-error" : ""}`}
        aria-invalid={hasFieldError(state, "password")}
        autoComplete="new-password"
        required
      />
      {firstFieldError(state, "password") ? (
        <p className="caption admin-field-error">{firstFieldError(state, "password")}</p>
      ) : (
        <p className="caption">Password must be at least 12 characters long.</p>
      )}

      {state.message ? <p className={`caption${state.success ? "" : " admin-field-error"}`}>{state.message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update Password"}
      </Button>
      <TextButton href="/signin">Back to sign in</TextButton>
    </form>
  )
}

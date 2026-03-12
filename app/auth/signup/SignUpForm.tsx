"use client"

/**
 * SignUpForm.tsx
 *
 * Client-side signup form used inside IT-only signup page shell.
 */

import { useActionState } from "react"
import { signUp, type SignUpActionState } from "../../../actions/auth.actions"
import { Button } from "../../../components/ui/Button"
import { TextButton } from "../../../components/ui/TextButton"

const INITIAL_STATE: SignUpActionState = {
  success: false,
}

function fieldError(state: SignUpActionState, field: string) {
  const firstError = state.fieldErrors?.[field]?.[0]
  return firstError ?? null
}

function hasFieldError(state: SignUpActionState, field: string): boolean {
  return Boolean(fieldError(state, field))
}

function inputClassName(state: SignUpActionState, field: string): string {
  if (hasFieldError(state, field)) return "admin-input admin-input-error"
  return "admin-input"
}

function labelClassName(state: SignUpActionState, field: string): string {
  if (hasFieldError(state, field)) return "label admin-field-error"
  return "label"
}

/**
 * Renders IT-only user creation form with server action submission.
 *
 * @returns Interactive account creation form
 */
export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, INITIAL_STATE)

  return (
    <div className="admin-content-stack admin-auth-form-wide w-full">
      <p className="body">Only signed-in IT users can create accounts for @cofactor.world users.</p>

      <form action={formAction} className="admin-card admin-auth-form admin-auth-form-wide">
        <div className="admin-form-grid">
          <label className={labelClassName(state, "name")} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={inputClassName(state, "name")}
            aria-invalid={hasFieldError(state, "name")}
            required
          />
          {fieldError(state, "name") ? <p className="caption admin-field-error">{fieldError(state, "name")}</p> : null}

          <label className={labelClassName(state, "email")} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={inputClassName(state, "email")}
            aria-invalid={hasFieldError(state, "email")}
            required
          />
          {fieldError(state, "email") ? <p className="caption admin-field-error">{fieldError(state, "email")}</p> : null}

          <label className={labelClassName(state, "password")} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={inputClassName(state, "password")}
            aria-invalid={hasFieldError(state, "password")}
            required
          />
          {fieldError(state, "password") ? (
            <p className="caption admin-field-error">{fieldError(state, "password")}</p>
          ) : null}

          <label className={labelClassName(state, "role")} htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className={inputClassName(state, "role")}
            aria-invalid={hasFieldError(state, "role")}
            defaultValue="ANALYST"
          >
            <option value="ANALYST">ANALYST</option>
            <option value="IT">IT</option>
          </select>
          {fieldError(state, "role") ? <p className="caption admin-field-error">{fieldError(state, "role")}</p> : null}

          {state.message ? <p className="caption">{state.message}</p> : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Account"}
          </Button>
          {state.success ? (
            <TextButton href="/auth/signup">Create another account</TextButton>
          ) : (
            <TextButton href="/dashboard">Back to dashboard</TextButton>
          )}
        </div>
      </form>
    </div>
  )
}

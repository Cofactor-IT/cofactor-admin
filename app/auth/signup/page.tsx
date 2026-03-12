"use client"

/**
 * page.tsx
 *
 * Domain-restricted signup page for Cofactor Admin internal accounts.
 */

import { useActionState } from "react"
import { signUp, type SignUpActionState } from "../../../actions/auth.actions"

const INITIAL_STATE: SignUpActionState = {
  success: false,
}

function fieldError(state: SignUpActionState, field: string) {
  const firstError = state.fieldErrors?.[field]?.[0]
  return firstError ?? null
}

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUp, INITIAL_STATE)

  return (
    <main className="admin-shell">
      <section className="admin-page-content">
        <h1>Admin Sign Up</h1>
        <p className="body">Only IT operators can create accounts for @cofactor.world users.</p>

        <form action={formAction} className="admin-card" style={{ maxWidth: "560px", padding: "24px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            <label className="label" htmlFor="creationKey">
              IT Operator Key
            </label>
            <input id="creationKey" name="creationKey" type="password" className="admin-input" required />

            <label className="label" htmlFor="name">
              Full name
            </label>
            <input id="name" name="name" type="text" className="admin-input" required />
            {fieldError(state, "name") ? <p className="caption">{fieldError(state, "name")}</p> : null}

            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="admin-input" required />
            {fieldError(state, "email") ? <p className="caption">{fieldError(state, "email")}</p> : null}

            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="admin-input" required />
            {fieldError(state, "password") ? (
              <p className="caption">{fieldError(state, "password")}</p>
            ) : null}

            <label className="label" htmlFor="role">
              Role
            </label>
            <select id="role" name="role" className="admin-input" defaultValue="ANALYST">
              <option value="ANALYST">ANALYST</option>
              <option value="IT">IT</option>
            </select>
            {fieldError(state, "role") ? <p className="caption">{fieldError(state, "role")}</p> : null}

            {state.message ? <p className="caption">{state.message}</p> : null}

            <button type="submit" className="button admin-nav-item-active" disabled={isPending}>
              {isPending ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

"use client"

/**
 * SignInForm.tsx
 *
 * Client-side credentials sign-in form UI.
 */

import { useMemo, useState } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/Button"
import { TextButton } from "../../../components/ui/TextButton"

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password."
const LOCKED_ACCOUNT_MESSAGE = "Too many attempts, try again in 15 minutes."
const RATE_LIMIT_MESSAGE = "Too many sign-in attempts from your network. Try again in 15 minutes."

interface SignInFormProps {
  callbackUrl: string
  errorCode?: string
}

function resolveErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null
  if (errorCode === "ACCOUNT_LOCKED") return LOCKED_ACCOUNT_MESSAGE
  if (errorCode === "RATE_LIMITED") return RATE_LIMIT_MESSAGE
  return INVALID_CREDENTIALS_MESSAGE
}

/**
 * Renders and submits Admin credentials sign-in form.
 *
 * @param props - Callback and error metadata from request URL
 * @returns Interactive sign-in form UI
 */
export function SignInForm(props: SignInFormProps) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const queryErrorMessage = useMemo(() => resolveErrorMessage(props.errorCode), [props.errorCode])
  const displayedError = inlineError ?? queryErrorMessage

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInlineError(null)
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: props.callbackUrl,
    })

    setIsSubmitting(false)
    if (result?.error) {
      setInlineError(resolveErrorMessage(result.error))
      return
    }

    router.push(props.callbackUrl)
    router.refresh()
  }

  return (
    <main className="admin-shell admin-auth-shell">
      <section className="admin-page-content admin-auth-content">
        <div className="admin-auth-stage">
          <div className="admin-auth-brand">
            <Image
              src="/branding/cofactor-header-logo.png"
              alt="Cofactor Admin wordmark"
              width={260}
              height={54}
              priority
            />
            <span className="admin-auth-brand-label">Admin</span>
          </div>

          <form className="admin-card admin-auth-form" onSubmit={handleSubmit}>
            <h1 className="m-0">Sign In</h1>
            <p className="body m-0">
              Use your @cofactor.world account.
            </p>

            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="admin-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="admin-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {displayedError ? <p className="caption">{displayedError}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <TextButton href="/auth/forgot-password">Forgot password?</TextButton>
            <TextButton href="/auth/signup">IT users: create account</TextButton>
          </form>
        </div>
      </section>
    </main>
  )
}

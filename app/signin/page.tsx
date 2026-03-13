/**
 * page.tsx
 *
 * Server page wrapper for the public Admin sign-in route.
 */

import { SignInForm } from "../auth/signin/SignInForm"

interface SignInPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getFirstParamValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

/**
 * Renders credentials sign-in page or redirects authenticated users to dashboard.
 *
 * @param props - Route search params
 * @returns Sign-in page UI
 */
export default async function SignInPage(props: SignInPageProps) {
  const params = (await props.searchParams) ?? {}
  const callbackUrl = getFirstParamValue(params.callbackUrl) ?? "/dashboard"
  const errorCode = getFirstParamValue(params.error)

  return <SignInForm callbackUrl={callbackUrl} errorCode={errorCode} />
}

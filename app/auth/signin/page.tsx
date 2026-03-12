/**
 * page.tsx
 *
 * Server page wrapper for Admin sign-in form.
 */

import { SignInForm } from "./SignInForm"

interface SignInPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getFirstParamValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

/**
 * Renders credentials sign-in page with request-provided callback/error params.
 *
 * @param props - Route search params
 * @returns Sign-in page UI
 */
export default async function SignInPage(props: SignInPageProps) {
  const params = (await props.searchParams) ?? {}
  const callbackUrl = getFirstParamValue(params.callbackUrl) ?? "/submissions"
  const errorCode = getFirstParamValue(params.error)

  return <SignInForm callbackUrl={callbackUrl} errorCode={errorCode} />
}

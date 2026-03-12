/**
 * page.tsx
 *
 * Redirects authenticated root traffic to the primary Admin workspace.
 */

import { redirect } from "next/navigation"

/**
 * Redirects the root route to submissions.
 *
 * @returns Never returns; forwards to `/submissions`
 */
export default function HomePage() {
  redirect("/submissions")
}

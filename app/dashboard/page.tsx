/**
 * page.tsx
 *
 * Default authenticated landing route for Admin.
 */

import { redirect } from "next/navigation"

/**
 * Redirects signed-in users to the primary submissions workspace.
 *
 * @returns Never returns; forwards to `/submissions`
 */
export default function DashboardPage() {
  redirect("/submissions")
}

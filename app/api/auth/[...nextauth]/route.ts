/**
 * route.ts
 *
 * NextAuth API handlers for credentials authentication.
 */

import NextAuth from "next-auth"
import { authConfig } from "../../../../lib/auth/config"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }

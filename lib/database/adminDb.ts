/**
 * adminDb.ts
 *
 * Read/write Prisma client for Cofactor Admin's own PostgreSQL database.
 * Uses a global singleton in development to avoid exhausting connections
 * during hot reload.
 */

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  adminPrisma: PrismaClient | undefined
}

export const adminDb =
  globalForPrisma.adminPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adminPrisma = adminDb
}

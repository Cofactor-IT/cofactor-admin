/**
 * layout.tsx
 *
 * Root layout for the Admin app.
 */

import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cofactor Admin",
  description: "Internal operations platform for Cofactor.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

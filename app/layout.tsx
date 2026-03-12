/**
 * layout.tsx
 *
 * Root layout for the Admin app.
 */

import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cofactor Admin",
  description: "Internal operations platform for Cofactor.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
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

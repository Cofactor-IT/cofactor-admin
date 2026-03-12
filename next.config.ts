/**
 * next.config.ts
 *
 * Next.js configuration for local and CI builds.
 */

import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: {
    position: "top-right",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig

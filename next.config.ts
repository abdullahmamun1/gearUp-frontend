import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  // Pin the project root: a stray package-lock.json higher up the tree
  // (e.g. in the home folder) otherwise makes Turbopack treat that folder as
  // the root.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.vecteezy.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  // The service worker must never be served stale, or fixes to it would
  // take a day to reach people.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]
  },
  // Dashboards moved from /<role>-dashboard to /dashboard/<role>. Keeps old
  // bookmarks and links in emails sent before the move working.
  async redirects() {
    return ["customer", "provider", "admin"].flatMap((role) => [
      {
        source: `/${role}-dashboard`,
        destination: `/dashboard/${role}`,
        permanent: true,
      },
      {
        source: `/${role}-dashboard/:path*`,
        destination: `/dashboard/${role}/:path*`,
        permanent: true,
      },
    ])
  },
}

export default withNextIntl(nextConfig)

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.vecteezy.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
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

export default nextConfig

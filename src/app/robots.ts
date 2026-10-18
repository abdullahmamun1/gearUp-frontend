import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or transactional pages: nothing for a search engine there.
      disallow: [
        "/dashboard",
        "/bn/dashboard",
        "/api/",
        "/payment-success",
        "/payment-cancelled",
        "/bn/payment-success",
        "/bn/payment-cancelled",
        "/offline.html",
        "/styleguide",
        "/bn/styleguide",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}

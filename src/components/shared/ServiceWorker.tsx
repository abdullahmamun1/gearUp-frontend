"use client"

import { useEffect } from "react"

import { captureInstallPrompt } from "@/hooks/useInstallPrompt"

/**
 * Registers `/sw.js` (production only: in development it would serve stale
 * builds) and starts listening for the browser's install offer.
 */
export function ServiceWorker() {
  useEffect(() => {
    captureInstallPrompt()
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // No offline page then; the site works the same.
      })
  }, [])

  return null
}

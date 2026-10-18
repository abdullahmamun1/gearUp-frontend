"use client"

import { useRouter } from "@/i18n/navigation"
import { useEffect, useTransition } from "react"

/**
 * Keeps an order page current without a manual reload. The status changes
 * on someone else's side (the provider confirms, Stripe's webhook lands, the
 * gear is checked in), so while the order is still moving this re-renders
 * the server page every `intervalMs` while the tab is visible, and at once
 * whenever the visitor comes back to the tab.
 */
export function OrderLiveRefresh({
  active,
  intervalMs = 15_000,
}: {
  /** False for finished orders: then only refocusing refreshes. */
  active: boolean
  intervalMs?: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    const refresh = () => startTransition(() => router.refresh())
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", refresh)

    const timer = active
      ? setInterval(() => {
          if (document.visibilityState === "visible") refresh()
        }, intervalMs)
      : undefined

    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", refresh)
      if (timer) clearInterval(timer)
    }
  }, [active, intervalMs, router])

  return null
}

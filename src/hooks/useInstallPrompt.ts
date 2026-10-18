"use client"

import { useSyncExternalStore } from "react"

/** Chromium's install event (not in the DOM typings yet). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

/**
 * Starts listening for the browser's install offer. Called once from
 * `ServiceWorker` in the root layout, so the event is caught on any page.
 */
export function captureInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener("appinstalled", () => {
    deferred = null
    notify()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * `canInstall` is true when the browser offers to install GearUp (Chromium,
 * not yet installed). `install()` shows the browser's own dialog.
 */
export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(
    subscribe,
    () => deferred !== null,
    () => false
  )

  async function install() {
    const event = deferred
    if (!event) return false
    deferred = null
    notify()
    await event.prompt()
    const { outcome } = await event.userChoice
    return outcome === "accepted"
  }

  return { canInstall, install }
}

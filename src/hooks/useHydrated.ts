import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * False while React hydrates server HTML, true afterwards. For per-user UI
 * inside prerendered markup: Suspense sections can hydrate *after* the
 * session has loaded, and rendering user-specific output then would not
 * match the server's HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

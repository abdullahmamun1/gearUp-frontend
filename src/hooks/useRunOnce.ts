"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Runs `action` once after mount and tracks its state. Guarded by a ref, so
 * React's development double-effect can't spend a one-time token twice.
 */
export function useRunOnce<T>(action: (() => Promise<T>) | null) {
  const started = useRef(false)
  const [state, setState] = useState<
    { status: "idle" | "running" } | { status: "done"; result: T }
  >({ status: action ? "running" : "idle" })

  useEffect(() => {
    if (!action || started.current) return
    started.current = true
    action().then((result) => setState({ status: "done", result }))
  }, [action])

  return state
}

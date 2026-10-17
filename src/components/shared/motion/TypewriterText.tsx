"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

/**
 * Types `text` out character by character, then calls `onDone`. With reduced
 * motion the full text shows at once. The complete text is always in the
 * accessible name, so screen readers don't hear it letter by letter.
 */
export function TypewriterText({
  text,
  speed = 28,
  delay = 0,
  onDone,
  className,
}: {
  text: string
  /** Milliseconds per character. */
  speed?: number
  delay?: number
  onDone?: () => void
  className?: string
}) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduced) {
      onDone?.()
      return
    }
    let count = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      count += 1
      setShown(count)
      if (count < text.length) timer = setTimeout(tick, speed)
      else onDone?.()
    }
    timer = setTimeout(tick, delay)
    return () => clearTimeout(timer)
    // Restart only when the text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced])

  const visible = reduced ? text : text.slice(0, shown)
  const typing = !reduced && shown < text.length

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{visible}</span>
      {typing && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse bg-current"
        />
      )}
    </span>
  )
}

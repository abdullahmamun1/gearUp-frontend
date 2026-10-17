"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Cycles through `words`: the current word rises into place while the last
 * one rises out and fades. Every word sits in the same grid cell, so the slot
 * is always as wide as the longest word and the line never reflows.
 *
 * `className` styles each word, not the wrapper: a `background-clip: text`
 * gradient on a parent doesn't paint animated children in Chromium, which
 * made the word blink out mid-swap. Screen readers get the whole list once.
 */
export function RotatingWord({
  words,
  interval = 2600,
  className,
}: {
  words: string[]
  interval?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || words.length < 2) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval
    )
    return () => clearInterval(timer)
  }, [interval, reduced, words.length])

  const previous = (index - 1 + words.length) % words.length

  return (
    // text-left: inside a centred heading, the word still starts right after
    // the text before it instead of floating in the middle of its slot.
    <span className="relative inline-grid text-left align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden
          className={cn(
            "col-start-1 row-start-1 transition-[translate,opacity] duration-500 ease-out motion-reduce:transition-none",
            i === index
              ? "translate-y-0 opacity-100"
              : i === previous
                ? "-translate-y-[0.35em] opacity-0"
                : "translate-y-[0.35em] opacity-0 duration-0",
            className
          )}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

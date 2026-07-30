"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <section className="mx-auto grid min-h-svh max-w-md place-content-center px-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm opacity-70">
            GearUp failed to load. Try again, and let us know if it keeps
            happening.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="h-9 cursor-pointer rounded-md border px-4 text-sm font-medium"
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- hard navigation on purpose: the root layout is what failed, so a client-side <Link /> would re-render it and throw again */}
            <a
              href="/"
              className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium"
            >
              Go home
            </a>
          </div>

          {error.digest && (
            <p className="mt-6 font-mono text-xs opacity-70">
              Reference: {error.digest}
            </p>
          )}
        </section>
      </body>
    </html>
  )
}

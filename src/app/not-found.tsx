import "./globals.css"

/**
 * Requests that never reached a locale (rare: the proxy routes everything
 * else through app/[locale]). Plain on purpose — there's no layout here.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-svh place-items-center bg-background p-4 text-center text-foreground">
        <div className="grid gap-3">
          <h1 className="text-2xl font-bold">Page not found</h1>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- no app shell here */}
          <a href="/" className="text-primary underline underline-offset-4">
            Go to GearUp
          </a>
        </div>
      </body>
    </html>
  )
}

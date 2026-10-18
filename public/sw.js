/*
 * GearUp service worker. Deliberately small:
 * - Hashed build assets, icons and fonts: cache-first (their URLs change when
 *   their content does).
 * - Page navigations: always the network; when offline, the cached
 *   /offline.html (plain HTML, no app code, so it can't try to fetch more).
 *   Pages are never cached, because many are signed-in.
 * - API calls, RSC payloads and anything that isn't a GET: never touched.
 */
const VERSION = "v2"
const STATIC_CACHE = `gearup-static-${VERSION}`
const OFFLINE_CACHE = `gearup-offline-${VERSION}`
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("gearup-") && !key.endsWith(VERSION)
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

const isStaticAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/"))

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE)
        return (await cache.match(OFFLINE_URL)) || Response.error()
      })
    )
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
  }
  // Everything else (API, RSC, images from other hosts…) goes straight to
  // the network as if there were no service worker.
})

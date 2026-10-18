import type { AbstractIntlMessages } from "next-intl"

/**
 * The part of the messages a client tree needs. Server components read
 * every message on the server; only what client components use has to be
 * serialised into the page, so each route group passes its own list
 * ("gear" for a whole namespace, "pages.help" for one subtree).
 */
export function pickMessages(
  messages: AbstractIntlMessages,
  paths: readonly string[]
): AbstractIntlMessages {
  const out: Record<string, unknown> = {}
  for (const path of paths) {
    const [namespace, ...rest] = path.split(".")
    let source: unknown = messages[namespace!]
    for (const key of rest) {
      source = (source as Record<string, unknown> | undefined)?.[key]
    }
    if (source === undefined) continue
    if (rest.length === 0) {
      out[namespace!] = source
      continue
    }
    // Rebuild the nesting for a subtree ("pages.help" → { pages: { help } }).
    let target = (out[namespace!] ??= {}) as Record<string, unknown>
    for (const key of rest.slice(0, -1)) {
      target = (target[key] ??= {}) as Record<string, unknown>
    }
    target[rest.at(-1)!] = source
  }
  return out as AbstractIntlMessages
}

/** Client messages per route group (see the layouts). */
export const CLIENT_MESSAGES = {
  root: ["common", "nav"],
  public: [
    "common",
    "nav",
    "gear",
    "ai",
    "auth",
    // Server-rendered copy (hero text, About, Privacy…) stays on the server.
    "home.earnings",
    "home.newsletter",
    "home.search",
    "home.testimonials",
    "pages.contact",
    "pages.help",
    "pages.newsletter",
    "pages.validation",
  ],
  dashboard: ["common", "nav", "dashboard", "gear", "ai"],
} as const

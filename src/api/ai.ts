"use server"

import { headers } from "next/headers"

import type { AppLocale } from "@/i18n/routing"
import { apiFetch } from "@/lib/apiClient"
import type {
  AiInsights,
  ChatMessage,
  GearFinderResult,
  ListingDraft,
  SearchSuggestion,
} from "@/types"

/**
 * The backend limits AI calls per visitor, but every request reaches it from
 * this server, so pass the visitor's IP along.
 */
async function clientHeaders(): Promise<Record<string, string>> {
  const list = await headers()
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    ""
  return ip ? { "x-client-ip": ip } : {}
}

export async function askGearFinder(input: {
  messages: ChatMessage[]
  from?: string
  to?: string
  /** The reply's language. */
  locale?: AppLocale
}) {
  return apiFetch<GearFinderResult>("/api/ai/gear-finder", {
    method: "POST",
    body: input,
    auth: false,
    headers: await clientHeaders(),
  })
}

export async function draftListing(input: {
  name: string
  brand?: string
  categoryId?: string
  notes?: string
  imageUrl?: string
  /** The draft's language. */
  locale?: AppLocale
}) {
  return apiFetch<ListingDraft>("/api/ai/listing-draft", {
    method: "POST",
    body: input,
    headers: await clientHeaders(),
  })
}

/** "Try: …" chips for the browse search box (cached on the backend). */
export async function suggestSearches(q: string, locale?: AppLocale) {
  return apiFetch<{ suggestions: SearchSuggestion[] }>(
    "/api/ai/search-suggest",
    {
      method: "POST",
      body: { q, locale },
      auth: false,
      headers: await clientHeaders(),
    }
  )
}

/** Admin analytics: a short AI summary of the range, with rule fallback. */
export async function getAnalyticsInsights(range: {
  from?: string
  to?: string
  locale?: AppLocale
}) {
  const query = new URLSearchParams(
    Object.entries(range).filter(([, value]) => value) as [string, string][]
  )
  return apiFetch<AiInsights>(`/api/admin/analytics/insights?${query}`, {
    headers: await clientHeaders(),
  })
}

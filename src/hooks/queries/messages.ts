"use client"

import { useQuery } from "@tanstack/react-query"

import { useHydrated } from "@/hooks/useHydrated"
import { useSessionUser } from "@/hooks/useSessionUser"
import { queryFetch } from "./fetcher"
import type { OrderMessage, UnreadMessages } from "@/types"

export const messageKeys = {
  thread: (orderId: string) => ["messages", orderId] as const,
  unread: ["messages", "unread"] as const,
}

/**
 * An order's thread. Vercel's serverless functions can't hold WebSockets, so
 * the open thread polls every 5 s (only while the tab is visible).
 */
export function useOrderMessages(orderId: string) {
  return useQuery({
    queryKey: messageKeys.thread(orderId),
    queryFn: () =>
      queryFetch<OrderMessage[]>(`/api/rentals/${orderId}/messages`),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}

/** Unread counts for badges; customers and providers only. */
export function useUnreadMessages() {
  const { user } = useSessionUser()
  const enabled = user?.role === "CUSTOMER" || user?.role === "PROVIDER"
  const query = useQuery({
    queryKey: messageKeys.unread,
    queryFn: () => queryFetch<UnreadMessages>("/api/messages/unread"),
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  // Badges are client-only: Suspense sections can hydrate after this query
  // resolves, and showing a count the server didn't render breaks hydration.
  const hydrated = useHydrated()
  return {
    total: hydrated ? (query.data?.total ?? 0) : 0,
    byOrder: hydrated ? (query.data?.byOrder ?? {}) : {},
    enabled,
  }
}

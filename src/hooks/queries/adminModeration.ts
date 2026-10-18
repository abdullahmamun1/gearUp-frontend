"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useHydrated } from "@/hooks/useHydrated"
import { useSessionUser } from "@/hooks/useSessionUser"
import { queryFetch } from "@/hooks/queries/fetcher"
import {
  toAdminQuery,
  type AdminClaimsFilters,
  type AdminInboxFilters,
  type AdminReviewsFilters,
  type AdminSubscribersFilters,
} from "@/utils/filters/admin"
import type {
  AdminAttention,
  ClaimList,
  ContactMessage,
  InboxList,
  Paginated,
  Review,
  SubscriberList,
} from "@/types"

export const adminReviewsKeys = {
  all: ["admin-reviews"] as const,
  list: (filters: AdminReviewsFilters) =>
    [...adminReviewsKeys.all, filters] as const,
}
export const claimsKeys = {
  all: ["admin-claims"] as const,
  list: (filters: AdminClaimsFilters) => [...claimsKeys.all, filters] as const,
}
export const inboxKeys = {
  all: ["admin-inbox"] as const,
  list: (filters: AdminInboxFilters) => [...inboxKeys.all, filters] as const,
  message: (id: string) => ["admin-inbox-message", id] as const,
}
export const subscribersKeys = {
  all: ["admin-subscribers"] as const,
  list: (filters: AdminSubscribersFilters) =>
    [...subscribersKeys.all, filters] as const,
}
export const attentionKeys = { all: ["admin-attention"] as const }

export function useAdminReviews(
  filters: AdminReviewsFilters,
  initialData?: Paginated<Review>
) {
  return useQuery({
    queryKey: adminReviewsKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<Review>>(
        `/api/admin/reviews?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function useClaims(
  filters: AdminClaimsFilters,
  initialData?: ClaimList
) {
  return useQuery({
    queryKey: claimsKeys.list(filters),
    queryFn: () =>
      queryFetch<ClaimList>(
        `/api/admin/claims?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function useInbox(filters: AdminInboxFilters, initialData?: InboxList) {
  return useQuery({
    queryKey: inboxKeys.list(filters),
    queryFn: () =>
      queryFetch<InboxList>(`/api/admin/inbox?${toAdminQuery({ ...filters })}`),
    initialData,
    placeholderData: keepPreviousData,
  })
}

/** One message; fetching it marks it read on the server. */
export function useInboxMessage(id: string) {
  return useQuery({
    queryKey: inboxKeys.message(id),
    queryFn: () => queryFetch<ContactMessage>(`/api/admin/inbox/${id}`),
  })
}

export function useSubscribers(
  filters: AdminSubscribersFilters,
  initialData?: SubscriberList
) {
  return useQuery({
    queryKey: subscribersKeys.list(filters),
    queryFn: () =>
      queryFetch<SubscriberList>(
        `/api/admin/subscribers?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

/** Sidebar badges for admins: open claims and unread contact messages. */
export function useAdminAttention() {
  const { user } = useSessionUser()
  const enabled = user?.role === "ADMIN"
  const query = useQuery({
    queryKey: attentionKeys.all,
    queryFn: () => queryFetch<AdminAttention>("/api/admin/attention"),
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
  // Client-only, like the message badges (see useUnreadMessages).
  const hydrated = useHydrated()
  return {
    claims: hydrated ? (query.data?.openClaims ?? 0) : 0,
    inbox: hydrated ? (query.data?.unreadMessages ?? 0) : 0,
  }
}

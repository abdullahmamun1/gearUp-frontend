"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { logout } from "@/api/auth"
import { queryFetch } from "@/hooks/queries/fetcher"
import type { JwtUser } from "@/types"

export const sessionKey = ["session"] as const

/**
 * The signed-in user on static pages (null when signed out). Public pages
 * are prerendered, so the session is read here, after the page loads, from
 * `/api/session`. It refreshes on every navigation, which picks up a login
 * or logout that happened through a redirect.
 */
export function useSessionUser() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: () => queryFetch<JwtUser | null>("/api/session"),
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: sessionKey })
  }, [pathname, queryClient])

  return { user: query.data ?? null, isPending: query.isPending }
}

/** Logs out and clears the cached session so the UI flips at once. */
export function useLogout() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.setQueryData(sessionKey, null)
    return logout()
  }
}

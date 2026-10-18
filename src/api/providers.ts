"use server"

import { apiFetch } from "@/lib/apiClient"
import type { ProviderProfile } from "@/types"

/** Public provider page data; cached like the rest of the catalogue. */
export async function getProviderProfile(id: string) {
  return apiFetch<ProviderProfile>(`/api/providers/${id}`, {
    auth: false,
    tags: ["gear", `provider:${id}`],
    revalidate: 300,
  })
}

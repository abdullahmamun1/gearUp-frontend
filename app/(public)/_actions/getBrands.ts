"use server"

import { apiFetch } from "@/lib/api"

export async function getBrands() {
  return apiFetch<string[]>("/api/brands", {
    auth: false,
    tags: ["brands", "gear"],
    revalidate: 60 * 60,
  })
}

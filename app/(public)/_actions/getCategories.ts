"use server"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/types"

export async function getCategories() {
  return apiFetch<Category[]>("/api/categories", {
    auth: false,
    tags: ["categories"],
    revalidate: 60 * 60,
  })
}

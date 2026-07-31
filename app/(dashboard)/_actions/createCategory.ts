"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { CategoryPayload } from "@/lib/schemas/category"
import type { Category } from "@/types"

export async function createCategory(payload: CategoryPayload) {
  const res = await apiFetch<Category>("/api/admin/category", {
    method: "POST",
    body: payload,
  })

  if (res.success) {
    revalidateTag("categories", { expire: 0 })
    refresh()
  }

  return res
}

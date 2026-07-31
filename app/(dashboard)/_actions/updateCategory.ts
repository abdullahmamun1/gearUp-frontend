"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { CategoryPayload } from "@/lib/schemas/category"
import type { Category } from "@/types"

export async function updateCategory(
  categoryId: string,
  payload: Partial<CategoryPayload>
) {
  const res = await apiFetch<Category>(`/api/admin/category/${categoryId}`, {
    method: "PATCH",
    body: payload,
  })

  if (res.success) {
    revalidateTag("categories", { expire: 0 })
    refresh()
  }

  return res
}

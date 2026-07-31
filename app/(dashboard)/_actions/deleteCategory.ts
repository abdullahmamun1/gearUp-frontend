"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/types"

export async function deleteCategory(categoryId: string) {
  const res = await apiFetch<Category>(`/api/admin/category/${categoryId}`, {
    method: "DELETE",
  })

  if (res.success) {
    revalidateTag("categories", { expire: 0 })
    refresh()
  }

  return res
}

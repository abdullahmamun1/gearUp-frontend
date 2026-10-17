"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/apiClient"
import type { Category } from "@/types"
import type { CategoryPayload } from "@/validation/category"

export async function getCategories() {
  return apiFetch<Category[]>("/api/categories", {
    auth: false,
    tags: ["categories"],
    revalidate: 60 * 60,
  })
}

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

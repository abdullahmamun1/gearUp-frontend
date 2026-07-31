"use server"

import { refresh } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { User, UserStatus } from "@/types"

export async function updateUserStatus(userId: string, status: UserStatus) {
  const res = await apiFetch<User>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: { status },
  })

  if (res.success) refresh()

  return res
}

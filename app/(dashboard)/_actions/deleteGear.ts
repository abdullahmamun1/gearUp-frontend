"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"

export async function deleteGear(gearId: string) {
  const res = await apiFetch<null>(`/api/provider/gear/${gearId}`, {
    method: "DELETE",
  })
  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }
  return res
}

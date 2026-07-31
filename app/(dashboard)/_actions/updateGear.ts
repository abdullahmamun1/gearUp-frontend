"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { GearPatch } from "@/lib/schemas/gear"
import type { GearItem } from "@/types"

export async function updateGear(gearId: string, payload: GearPatch) {
  const res = await apiFetch<GearItem>(`/api/provider/gear/${gearId}`, {
    method: "PUT",
    body: payload,
  })

  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }

  return res
}

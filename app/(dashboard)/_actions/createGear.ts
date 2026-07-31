"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { GearPayload } from "@/lib/schemas/gear"
import type { GearItem } from "@/types"

export async function createGear(payload: GearPayload) {
  const res = await apiFetch<GearItem>("/api/provider/gear", {
    method: "POST",
    body: payload,
  })

  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }

  return res
}

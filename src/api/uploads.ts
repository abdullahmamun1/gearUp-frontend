"use server"

import { apiFetch } from "@/lib/apiClient"
import type { UploadSignature } from "@/types"

/** One signature covers a batch of uploads to the same folder for an hour. */
export async function getUploadSignature(purpose: "gear" | "avatar") {
  return apiFetch<UploadSignature>("/api/uploads/signature", {
    method: "POST",
    body: { purpose },
  })
}

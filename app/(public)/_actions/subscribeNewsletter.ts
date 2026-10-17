"use server"

import { apiFetch } from "@/lib/api"
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/schemas/newsletter"

export async function subscribeNewsletter(payload: NewsletterInput) {
  const parsed = newsletterSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form.",
    }
  }

  const res = await apiFetch<{ status: "pending" | "subscribed" }>(
    "/api/newsletter",
    { method: "POST", body: parsed.data, auth: false }
  )

  if (!res.success) {
    return {
      success: false,
      message:
        res.statusCode === 429
          ? res.message
          : "We couldn't sign you up right now. Please try again.",
    }
  }

  return {
    success: true,
    message:
      res.data?.status === "subscribed"
        ? "You're already on the list."
        : "Almost there — check your inbox to confirm.",
  }
}

export async function confirmNewsletter(token: string) {
  return apiFetch<{ email: string }>("/api/newsletter/confirm", {
    method: "POST",
    body: { token },
    auth: false,
  })
}

export async function unsubscribeNewsletter(token: string) {
  return apiFetch<{ email: string }>("/api/newsletter/unsubscribe", {
    method: "POST",
    body: { token },
    auth: false,
  })
}

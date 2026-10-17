"use server"

import { apiFetch } from "@/lib/api"
import { contactSchema, type ContactInput } from "@/lib/schemas/contact"

export async function sendContactMessage(payload: ContactInput) {
  const parsed = contactSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form.",
    }
  }

  const res = await apiFetch<{ id: string }>("/api/contact", {
    method: "POST",
    body: parsed.data,
    auth: false,
  })

  if (!res.success) {
    return {
      success: false,
      message:
        res.statusCode === 429
          ? res.message
          : "We couldn't send your message. Please try again in a moment.",
    }
  }

  return {
    success: true,
    message: `Thanks, ${parsed.data.name.split(/\s+/)[0]} — your message is with us. We've emailed you a copy.`,
  }
}

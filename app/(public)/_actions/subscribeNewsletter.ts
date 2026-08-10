"use server"

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

  return {
    success: true,
    message: "You're on the list — we'll only email when new gear lands.",
  }
}

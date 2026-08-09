"use server"

import { contactSchema, type ContactInput } from "@/lib/schemas/contact"

export async function sendContactMessage(payload: ContactInput) {
  const parsed = contactSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form.",
    }
  }

  return {
    success: true,
    message: `Thanks, ${parsed.data.name.split(/\s+/)[0]} — your message is with us.`,
  }
}

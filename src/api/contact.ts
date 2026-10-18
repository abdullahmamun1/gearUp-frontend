"use server"

import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import { apiFetch } from "@/lib/apiClient"
import type { Locale } from "@/types"
import { contactSchema, type ContactInput } from "@/validation/contact"

/**
 * `locale` picks the language of the auto-reply email; it defaults to the
 * caller's page locale.
 */
export async function sendContactMessage(
  payload: ContactInput,
  locale?: Locale
) {
  const t = await getTranslations("pages")
  const parsed = contactSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: await issueText(parsed.error.issues[0]?.message),
    }
  }

  const res = await apiFetch<{ id: string }>("/api/contact", {
    method: "POST",
    body: { ...parsed.data, locale: locale ?? (await getLocale()) },
    auth: false,
  })

  if (!res.success) {
    return {
      success: false,
      message:
        res.statusCode === 429 ? res.message : t("contact.result.failed"),
    }
  }

  return {
    success: true,
    message: t("contact.result.sent", {
      name: parsed.data.name.split(/\s+/)[0] ?? "",
    }),
  }
}

/** The schema's message keys ("pages.validation.…") as text. */
async function issueText(key?: string) {
  const t = await getTranslations()
  if (key && t.has(key as never)) return t(key as never) as string
  return t("pages.validation.checkForm")
}

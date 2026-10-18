"use server"

import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import { apiFetch } from "@/lib/apiClient"
import type { Locale } from "@/types"
import { newsletterSchema, type NewsletterInput } from "@/validation/newsletter"

/**
 * `locale` picks the language of the confirmation email; it defaults to the
 * caller's page locale.
 */
export async function subscribeNewsletter(
  payload: NewsletterInput,
  locale?: Locale
) {
  const t = await getTranslations("pages")
  const parsed = newsletterSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: await issueText(parsed.error.issues[0]?.message),
    }
  }

  const res = await apiFetch<{ status: "pending" | "subscribed" }>(
    "/api/newsletter",
    {
      method: "POST",
      body: { ...parsed.data, locale: locale ?? (await getLocale()) },
      auth: false,
    }
  )

  if (!res.success) {
    return {
      success: false,
      message:
        res.statusCode === 429 ? res.message : t("newsletter.signupFailed"),
    }
  }

  return {
    success: true,
    message:
      res.data?.status === "subscribed"
        ? t("newsletter.alreadySubscribed")
        : t("newsletter.checkInbox"),
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

/** The schema's message keys ("pages.validation.…") as text. */
async function issueText(key?: string) {
  const t = await getTranslations()
  if (key && t.has(key as never)) return t(key as never) as string
  return t("pages.validation.checkForm")
}

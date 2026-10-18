"use client"

import { useTranslations } from "@/i18n/translations"

/**
 * Zod schemas (src/validation) use message *keys* such as
 * "auth.validation.emailInvalid", because they're defined at module level
 * where there's no locale. This turns a key into text; anything else (e.g.
 * a message from the backend) is shown as is.
 */
/** "namespace.some.key": lowercase, dotted, no spaces. */
const KEY = /^[a-z]+(\.[A-Za-z0-9_]+)+$/

export function useErrorMessage() {
  const t = useTranslations()
  return (message?: string | null) => {
    if (!message) return message ?? undefined
    if (KEY.test(message) && t.has(message as never)) {
      return t(message as never)
    }
    return message
  }
}

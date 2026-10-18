"use client"

import { useTransition } from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { saveDigits, saveLocale } from "@/api/auth"
import { usePathname } from "@/i18n/navigation"
import { localizedPath } from "@/i18n/routing"
import type { Digits } from "@/i18n/format"
import { cn } from "@/lib/utils"
import type { Locale } from "@/types"

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা" },
]

/**
 * Language (saved to the account: it also picks the language of emails)
 * and, in Bangla, Bengali or Latin digits for the dashboards.
 */
export function LanguageSettings({ digits }: { digits: Digits }) {
  const t = useTranslations("dashboard.language")
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function chooseLanguage(next: Locale) {
    if (next === locale) return
    startTransition(async () => {
      await saveLocale(next)
      // Full load to the clean URL (see LocaleSwitcher).
      window.location.assign(localizedPath(next, pathname))
    })
  }

  function chooseDigits(next: Digits) {
    if (next === digits) return
    startTransition(async () => {
      await saveDigits(next)
      toast.success(next === "latin" ? t("usingLatin") : t("usingNative"))
    })
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-xs">
      <h2 className="flex items-center gap-2 font-heading font-semibold">
        <Languages className="size-4 text-primary" aria-hidden />
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      <Choice
        label={t("label")}
        options={LANGUAGES}
        value={locale}
        onChange={chooseLanguage}
        disabled={isPending}
      />
      {locale === "bn" && (
        <Choice
          label={t("numbers")}
          options={[
            { value: "native", label: "১২৩" },
            { value: "latin", label: "123" },
          ]}
          value={digits}
          onChange={chooseDigits}
          disabled={isPending}
        />
      )}
    </section>
  )
}

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  disabled: boolean
}) {
  return (
    <div className="mt-4 grid gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-2">
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-9 flex-1 cursor-pointer rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-60",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-accent"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

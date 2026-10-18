import { useTranslations } from "@/i18n/translations"

import { cn } from "@/lib/utils"

const LEVELS = [
  { label: "tooShort", bar: "bg-destructive", text: "text-destructive" },
  { label: "weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "fair", bar: "bg-warning", text: "text-warning" },
  { label: "good", bar: "bg-lagoon", text: "text-lagoon" },
  { label: "strong", bar: "bg-success", text: "text-success" },
] as const

/** 0 (too short) to 4: length first, then a mix of character kinds. */
export function passwordScore(password: string) {
  if (password.length < 8) return 0
  let score = 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++
  return score
}

/** A four-segment meter under the new-password field. Advisory only. */
export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("auth.strength")
  if (!password) return null
  const score = passwordScore(password)
  const level = LEVELS[score]!

  return (
    <div className="-mt-2 grid gap-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-colors duration-300",
              score >= step ? level.bar : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("label")}{" "}
        <span className={cn("font-medium", level.text)}>
          {t(`levels.${level.label}`)}
        </span>
        {score > 0 && score < 4 && t("hint")}
      </p>
    </div>
  )
}

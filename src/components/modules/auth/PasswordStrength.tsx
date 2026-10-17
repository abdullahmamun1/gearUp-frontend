import { cn } from "@/lib/utils"

const LEVELS = [
  { label: "Too short", bar: "bg-destructive", text: "text-destructive" },
  { label: "Weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-lagoon", text: "text-lagoon" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
]

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
        Password strength:{" "}
        <span className={cn("font-medium", level.text)}>{level.label}</span>
        {score > 0 && score < 4 && " · mix cases, numbers and symbols"}
      </p>
    </div>
  )
}

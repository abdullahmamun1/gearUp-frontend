import { GoogleIcon } from "@/components/shared/SocialIcons"
import { buttonVariants } from "@/components/ui/button"
import { GOOGLE_START_PATH } from "@/lib/routes"
import { cn } from "@/lib/utils"
import type { RegisterRole } from "@/types"

export function GoogleButton({
  label = "Continue with Google",
  redirectTo,
  role,
  disabled = false,
}: {
  label?: string
  redirectTo?: string
  role?: RegisterRole
  disabled?: boolean
}) {
  const params = new URLSearchParams()
  if (redirectTo) params.set("redirectTo", redirectTo)
  if (role) params.set("role", role)

  const query = params.toString()

  return (
    <a
      href={query ? `${GOOGLE_START_PATH}?${query}` : GOOGLE_START_PATH}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-10 w-full gap-2.5 text-sm",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <GoogleIcon className="size-4" />
      {label}
    </a>
  )
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="text-xs text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  )
}

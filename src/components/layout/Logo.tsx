import { Link } from "@/i18n/navigation"
import { useTranslations } from "@/i18n/translations"
import { Mountain } from "lucide-react"

import { cn } from "@/lib/utils"

/** Brand mark: gradient tile + wordmark. */
export function Logo({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  const t = useTranslations("nav.logo")

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={t("home")}
      className={cn(
        "group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-(image:--gradient-brand) shadow-glow-primary transition-transform duration-300 group-hover:-rotate-6">
        <Mountain className="size-[22px] text-primary-foreground" aria-hidden />
      </span>
      <span className="font-heading text-[22px] font-bold tracking-tight">
        GearUp
      </span>
    </Link>
  )
}

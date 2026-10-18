import { Link } from "@/i18n/navigation"
import { ArrowRight, CalendarCheck, ShieldCheck, Wallet } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Magnetic } from "@/components/shared/motion/Magnetic"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { EarningsCalculator } from "./EarningsCalculator"

const POINTS = [
  { icon: Wallet, text: "pointPaid" },
  { icon: ShieldCheck, text: "pointDeposit" },
  { icon: CalendarCheck, text: "pointConfirm" },
] as const

export function ProviderCta() {
  const t = useTranslations("home.provider")

  return (
    <section
      id="earn"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:py-20"
    >
      <div className="reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-eyebrow text-primary">{t("eyebrow")}</p>
          <h2 className="mt-2 text-h2">{t("title")}</h2>
          <p className="mt-3 max-w-md text-muted-foreground">{t("intro")}</p>
          <ul className="mt-6 grid gap-3">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <point.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5">{t(point.text)}</span>
              </li>
            ))}
          </ul>
          <Magnetic className="mt-8 inline-flex">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "group h-11 gap-1.5 px-6 text-sm"
              )}
            >
              {t("cta")}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Magnetic>
        </div>

        <EarningsCalculator />
      </div>
    </section>
  )
}

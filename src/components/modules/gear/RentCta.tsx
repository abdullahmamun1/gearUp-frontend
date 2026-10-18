"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"

import { RentPanel } from "./RentPanel"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

/**
 * Client island: the gear page itself is prerendered (ISR), and this decides
 * what to show once it knows who is signed in.
 */
export function RentCta({ gear }: { gear: GearItem }) {
  const t = useTranslations("gear.rent")
  const { user: session, isPending } = useSessionUser()
  const outOfStock = !gear.isAvailable || gear.stock < 1

  if (outOfStock) {
    return <Notice>{t("unavailable")}</Notice>
  }

  if (isPending) {
    return <Skeleton className="h-[420px] rounded-xl" />
  }

  if (!session) {
    return (
      <div className="rounded-2xl border bg-card p-4 shadow-xs">
        <p className="font-heading text-sm font-semibold">{t("title")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("loginPrompt")}
        </p>
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/gear/${gear.id}`)}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-4 h-11 w-full text-sm"
          )}
        >
          {t("loginCta")}
        </Link>
      </div>
    )
  }

  if (session.role !== "CUSTOMER") {
    return <Notice>{t(`wrongRole.${session.role}`)}</Notice>
  }

  return (
    <RentPanel
      gearId={gear.id}
      pricePerDay={gear.pricePerDay}
      depositAmount={Number(gear.depositAmount ?? 0)}
      stock={gear.stock}
    />
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  )
}

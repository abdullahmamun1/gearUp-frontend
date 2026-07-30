import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { buildGearHref, type GearFilters } from "@/lib/gearQuery"
import { cn } from "@/lib/utils"

export function GearPagination({
  filters,
  totalPages,
}: {
  filters: GearFilters
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const { page } = filters

  return (
    <nav
      aria-label="Gear pagination"
      className="mt-10 flex items-center justify-center gap-3"
    >
      <PageLink filters={filters} page={page - 1} disabled={page <= 1}>
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </PageLink>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <PageLink filters={filters} page={page + 1} disabled={page >= totalPages}>
        Next
        <ChevronRight className="size-4" aria-hidden />
      </PageLink>
    </nav>
  )
}

function PageLink({
  filters,
  page,
  disabled,
  children,
}: {
  filters: GearFilters
  page: number
  disabled: boolean
  children: React.ReactNode
}) {
  const className = cn(
    buttonVariants({ variant: "outline", size: "lg" }),
    "h-9 gap-1 text-sm"
  )

  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(className, "pointer-events-none opacity-50")}
      >
        {children}
      </span>
    )
  }

  return (
    <Link href={buildGearHref({ ...filters, page })} className={className}>
      {children}
    </Link>
  )
}

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Pagination({
  page,
  totalPages,
  hrefFor,
  label,
  className,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
  label: string
  className?: string
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={label}
      className={cn("mt-10 flex items-center justify-center gap-3", className)}
    >
      <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </PageLink>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages}>
        Next
        <ChevronRight className="size-4" aria-hidden />
      </PageLink>
    </nav>
  )
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string
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
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

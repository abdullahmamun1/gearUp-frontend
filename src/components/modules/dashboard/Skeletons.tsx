import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      {action && <Skeleton className="h-10 w-32" />}
    </div>
  )
}

export function StatCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="mt-2 h-8 w-14" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Skeleton className="h-24 rounded-none sm:h-28" />
        <div className="flex items-end gap-4 px-5 pb-5 sm:px-6">
          <Skeleton className="-mt-10 size-20 rounded-2xl ring-4 ring-card" />
          <div className="grid gap-2 pb-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <PanelSkeleton rows={3} />
        <PanelSkeleton rows={2} />
      </div>
    </>
  )
}

/** The gradient welcome banner on each overview. */
export function BannerSkeleton() {
  return <Skeleton className="mb-6 h-44 rounded-2xl sm:h-48" />
}

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border bg-card shadow-xs">
      <div className="border-b px-5 py-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="size-10 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Banner, stat cards, optional charts, then two panels. */
export function OverviewSkeleton({ charts = false }: { charts?: boolean }) {
  return (
    <>
      <BannerSkeleton />
      <StatCardsSkeleton count={4} />
      {charts && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={3} />
      </div>
    </>
  )
}

export function ChartCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-4 h-50 w-full" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  )
}

export function FilterBarSkeleton({
  fields = 1,
  search = false,
}: {
  fields?: number
  search?: boolean
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 shadow-xs">
      {search && <Skeleton className="h-14 min-w-56 flex-1" />}
      {Array.from({ length: fields }, (_, i) => (
        <Skeleton key={i} className="h-14 w-44" />
      ))}
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 border-b px-4 py-4 last:border-b-0">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

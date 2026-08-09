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
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-7 w-12" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="grid max-w-lg gap-6">
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 bg-card px-4 py-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
    </>
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

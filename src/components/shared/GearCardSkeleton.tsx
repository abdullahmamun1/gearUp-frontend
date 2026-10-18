import { Skeleton } from "@/components/ui/skeleton"

export function GearCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="grid gap-3 border-t border-dashed pt-3.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function GearGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <GearCardSkeleton key={i} />
      ))}
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

import { SectionSkeleton } from "./SectionSkeleton"

export function PlatformStatsSkeleton() {
  return (
    <SectionSkeleton tone="muted">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="mt-4 h-9 w-20" />
            <Skeleton className="mt-1.5 h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
        ))}
      </div>
    </SectionSkeleton>
  )
}

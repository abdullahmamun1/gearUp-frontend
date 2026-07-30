import { Skeleton } from "@/components/ui/skeleton"
import { PageHeaderSkeleton } from "../../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-24" />
      <PageHeaderSkeleton action />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-4 w-16" />
          <ul className="mt-3 grid gap-3">
            {Array.from({ length: 2 }, (_, i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="size-14 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-1.5 h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-14" />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-4 w-48" />
          <Skeleton className="mt-1.5 h-3 w-16" />
          <div className="my-4 h-px bg-border" />
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { PageHeaderSkeleton } from "../../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-4 h-4 w-28" />
      <PageHeaderSkeleton action />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 grid gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-4"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-border" />
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-3 h-4 w-48" />
          <Skeleton className="mt-3 h-5 w-20" />
          <div className="my-4 h-px bg-border" />
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { PageHeaderSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="grid max-w-lg gap-px overflow-hidden rounded-xl border bg-border">
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
    </>
  )
}

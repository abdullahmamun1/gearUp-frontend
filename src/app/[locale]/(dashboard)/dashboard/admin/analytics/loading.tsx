import {
  ChartCardSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "@/components/modules/dashboard/Skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <Skeleton className="mb-6 h-10 w-full max-w-2xl rounded-full" />
      <StatCardsSkeleton />
      <div className="mt-6">
        <ChartCardSkeleton />
      </div>
    </>
  )
}

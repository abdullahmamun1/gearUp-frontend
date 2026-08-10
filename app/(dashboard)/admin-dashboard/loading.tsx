import {
  ChartCardSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} className="sm:grid-cols-3 lg:grid-cols-3" />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </>
  )
}

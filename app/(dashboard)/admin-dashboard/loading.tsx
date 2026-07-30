import { PageHeaderSkeleton, StatCardsSkeleton } from "../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} className="sm:grid-cols-3 lg:grid-cols-3" />
    </>
  )
}

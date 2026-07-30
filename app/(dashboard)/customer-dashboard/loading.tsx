import { PageHeaderSkeleton, StatCardsSkeleton } from "../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <StatCardsSkeleton count={4} />
    </>
  )
}

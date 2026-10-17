import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <StatCardsSkeleton count={4} />
    </>
  )
}

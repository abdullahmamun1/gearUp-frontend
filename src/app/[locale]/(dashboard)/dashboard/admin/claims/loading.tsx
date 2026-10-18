import {
  PageHeaderSkeleton,
  PanelSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <PanelSkeleton rows={3} />
    </>
  )
}

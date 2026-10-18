import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FilterBarSkeleton fields={1} search />
      <PanelSkeleton rows={5} />
    </>
  )
}

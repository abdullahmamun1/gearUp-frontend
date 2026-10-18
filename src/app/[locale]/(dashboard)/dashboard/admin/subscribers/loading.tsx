import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <FilterBarSkeleton fields={1} search />
      <TableSkeleton columns={4} rows={5} />
    </>
  )
}

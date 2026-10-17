import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FilterBarSkeleton fields={2} />
      <TableSkeleton columns={5} rows={5} />
    </>
  )
}

import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <FilterBarSkeleton />
      <TableSkeleton columns={6} rows={5} />
    </>
  )
}

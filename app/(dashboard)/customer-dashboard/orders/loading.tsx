import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <FilterBarSkeleton />
      <TableSkeleton columns={5} rows={5} />
    </>
  )
}

import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FilterBarSkeleton fields={2} search />
      <TableSkeleton columns={6} rows={5} />
    </>
  )
}

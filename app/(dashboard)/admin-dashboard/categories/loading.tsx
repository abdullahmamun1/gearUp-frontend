import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <FilterBarSkeleton fields={0} search />
      <TableSkeleton columns={4} rows={6} />
    </>
  )
}

import { PageHeaderSkeleton, TableSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton columns={7} rows={5} />
    </>
  )
}

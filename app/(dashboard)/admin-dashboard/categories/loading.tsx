import { PageHeaderSkeleton, TableSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <TableSkeleton columns={3} rows={6} />
    </>
  )
}

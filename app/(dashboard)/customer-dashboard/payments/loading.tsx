import { PageHeaderSkeleton, TableSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <TableSkeleton columns={6} rows={5} />
    </>
  )
}

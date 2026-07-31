import { Skeleton } from "@/components/ui/skeleton"

import { PageHeaderSkeleton, TableSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <Skeleton className="h-14 w-44" />
        <Skeleton className="h-14 w-44" />
      </div>
      <TableSkeleton columns={5} rows={5} />
    </>
  )
}

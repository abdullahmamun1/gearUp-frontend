import { Skeleton } from "@/components/ui/skeleton"

import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/modules/dashboard/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-xs">
        <Skeleton className="h-14 w-44" />
      </div>
      <TableSkeleton columns={7} rows={5} />
    </>
  )
}

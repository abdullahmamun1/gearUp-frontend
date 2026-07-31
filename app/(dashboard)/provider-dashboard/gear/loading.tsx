import { Skeleton } from "@/components/ui/skeleton"

import { PageHeaderSkeleton, TableSkeleton } from "../../_components/Skeletons"

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mb-6 grid gap-4 rounded-xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-14 lg:col-span-2" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
        <Skeleton className="h-9 sm:w-52" />
      </div>
      <TableSkeleton columns={6} rows={5} />
    </>
  )
}

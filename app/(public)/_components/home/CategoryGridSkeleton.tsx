import { Skeleton } from "@/components/ui/skeleton"

export function CategoryGridSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="mt-4 h-5 w-28" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-20" />
          </div>
        ))}
      </div>
    </section>
  )
}

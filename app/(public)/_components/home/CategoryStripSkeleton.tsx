import { Skeleton } from "@/components/ui/skeleton"

export function CategoryStripSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <Skeleton className="h-4 w-36" />
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
    </section>
  )
}

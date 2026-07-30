import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-4 w-32" />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Skeleton className="aspect-4/3 w-full rounded-xl" />
          <div className="mt-2.5 flex gap-2.5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-lg" />
            ))}
          </div>

          <Skeleton className="mt-8 h-4 w-32" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-1.5 h-4 w-28" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-2/3" />
          <Skeleton className="mt-6 h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-40 w-full rounded-xl" />
        </div>
      </div>
    </section>
  )
}

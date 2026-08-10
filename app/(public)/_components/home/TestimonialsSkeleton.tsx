import { Skeleton } from "@/components/ui/skeleton"

export function TestimonialsSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-2 h-4 w-80" />

      <div className="mt-6 flex gap-5 overflow-hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="w-[min(20rem,80vw)] shrink-0 rounded-xl border bg-card p-5 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <Skeleton className="size-5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-4/5" />
            <Skeleton className="mt-4 h-3.5 w-20" />
            <Skeleton className="mt-2 h-4 w-28" />
            <Skeleton className="mt-1.5 h-3 w-36" />
          </div>
        ))}
      </div>
    </section>
  )
}

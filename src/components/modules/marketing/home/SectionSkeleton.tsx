import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function SectionSkeleton({
  tone = "plain",
  children,
}: {
  tone?: "plain" | "muted"
  children: React.ReactNode
}) {
  return (
    <section className={cn(tone === "muted" && "border-y bg-muted/30")}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        {children}
      </div>
    </section>
  )
}

import { GearGridSkeleton } from "@/components/shared/GearCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedGearSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6">
        <GearGridSkeleton count={8} />
      </div>
    </section>
  )
}

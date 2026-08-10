import { GearGridSkeleton } from "@/components/shared/GearCardSkeleton"

import { SectionSkeleton } from "./SectionSkeleton"

export function FeaturedGearSkeleton() {
  return (
    <SectionSkeleton tone="muted">
      <GearGridSkeleton count={8} />
    </SectionSkeleton>
  )
}

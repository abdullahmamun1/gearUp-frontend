import { Skeleton } from "@/components/ui/skeleton"

import { SectionSkeleton } from "./SectionSkeleton"

export function CategoryGridSkeleton() {
  return (
    <SectionSkeleton>
      <div className="grid auto-rows-[minmax(10rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className={
              i < 2 ? "rounded-2xl sm:col-span-2 lg:row-span-2" : "rounded-2xl"
            }
          />
        ))}
      </div>
    </SectionSkeleton>
  )
}

import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function Stars({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  const rounded = Math.round(rating)

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-3.5",
            star <= rounded
              ? "fill-amber-500 text-amber-500"
              : "fill-muted text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  )
}

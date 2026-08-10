import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getFeaturedGear } from "@/app/(public)/_actions/getGear"
import { GearCard } from "@/components/shared/GearCard"

import { Section } from "./Section"

export async function FeaturedGear() {
  const res = await getFeaturedGear(8)
  const items = res.data?.data ?? []

  return (
    <Section
      tone="muted"
      eyebrow="Ready now"
      title="Featured gear"
      description="The newest kit available right now."
      action={
        <Link
          href="/gear"
          className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      }
    >
      {!res.success ? (
        <p className="text-sm text-muted-foreground">
          {res.message || "Couldn't load gear. Please try again."}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gear listed yet. Check back soon — providers are adding kit all the
          time.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((gear) => (
            <GearCard key={gear.id} gear={gear} />
          ))}
        </div>
      )}
    </Section>
  )
}

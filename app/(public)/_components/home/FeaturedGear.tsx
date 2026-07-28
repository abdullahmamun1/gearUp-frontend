import Link from "next/link"
import { ArrowRight, PackageOpen } from "lucide-react"

import { getFeaturedGear } from "@/app/(public)/_actions/getGear"
import { GearCard } from "@/components/shared/GearCard"

export async function FeaturedGear() {
  const res = await getFeaturedGear(8)

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Featured gear
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The newest kit available right now.
          </p>
        </div>
        <Link
          href="/gear"
          className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-6">
        {!res.success ? (
          <EmptyState
            title="Couldn't load gear"
            body={res.message || "Please try again in a moment."}
          />
        ) : res.data.length === 0 ? (
          <EmptyState
            title="No gear listed yet"
            body="Check back soon — providers are adding kit all the time."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {res.data.map((gear) => (
              <GearCard key={gear.id} gear={gear} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <PackageOpen
        className="mx-auto size-8 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="mt-3 font-heading font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

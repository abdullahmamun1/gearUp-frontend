import Link from "next/link"

import { getCategories } from "@/app/(public)/_actions/getCategories"
import { categoryIcon } from "@/lib/categoryIcons"

export async function CategoryGrid() {
  const res = await getCategories()

  if (!res.success || !res.data?.length) {
    return null
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="font-heading text-2xl font-bold sm:text-3xl">
        Browse by category
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {res.data.length} kinds of kit, all rented by the day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {res.data.map((category) => {
          const Icon = categoryIcon(category.name)
          const count = category._count?.gearItems ?? 0

          return (
            <Link
              key={category.id}
              href={`/gear?category=${category.id}`}
              className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span
                className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"
                aria-hidden
              >
                <Icon className="size-5" />
              </span>

              <h3 className="mt-4 font-heading font-semibold group-hover:text-primary">
                {category.name}
              </h3>

              {category.description && (
                <p className="mt-1.5 line-clamp-2 text-sm text-pretty text-muted-foreground">
                  {category.description}
                </p>
              )}

              <p className="mt-auto pt-3 text-xs text-muted-foreground">
                {count} {count === 1 ? "listing" : "listings"}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

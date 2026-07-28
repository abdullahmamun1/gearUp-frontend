import Link from "next/link"

import { getCategories } from "@/app/(public)/_actions/getCategories"

export async function CategoryStrip() {
  const res = await getCategories()

  if (!res.success || !res.data?.length) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">
        Browse by category
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {res.data.map((category) => (
          <Link
            key={category.id}
            href={`/gear?category=${category.id}`}
            className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

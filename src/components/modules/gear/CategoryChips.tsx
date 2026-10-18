import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"

import { categoryIcon } from "@/constants/categoryIcons"
import { cn } from "@/lib/utils"
import { buildGearHref, type GearFilters } from "@/utils/filters/gear"
import type { Category } from "@/types"

/** One-tap category switcher above the filters; scrolls sideways on phones. */
export function CategoryChips({
  categories,
  filters,
}: {
  categories: Category[]
  filters: GearFilters
}) {
  const t = useTranslations("gear.filters")
  const chips = [{ id: undefined, name: t("allGear") }, ...categories]

  return (
    <nav
      aria-label={t("categories")}
      className="-mx-4 mt-6 [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-16px),transparent)] px-4"
    >
      <ul className="flex w-max snap-x gap-2 py-1">
        {chips.map((chip) => {
          const active = filters.category === chip.id
          const Icon = chip.id ? categoryIcon(chip.name) : null
          return (
            <li key={chip.id ?? "all"} className="snap-start">
              <Link
                href={buildGearHref({ ...filters, category: chip.id, page: 1 })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-glow-primary"
                    : "bg-card hover:border-primary/40 hover:bg-accent"
                )}
              >
                {Icon && <Icon className="size-4" aria-hidden />}
                {chip.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

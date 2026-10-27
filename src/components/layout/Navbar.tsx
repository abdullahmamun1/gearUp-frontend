import { getBrands, getFeaturedGear } from "@/api/gear"
import { getCategories } from "@/api/categories"
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

import { AccountArea } from "./AccountArea"
import { CommandPalette } from "./CommandPalette"
import { DesktopNav, type NavCategory, type NavFeatured } from "./DesktopNav"
import { Logo } from "./Logo"
import { MobileNav } from "./MobileNav"
import { NavbarShell } from "./NavbarShell"
import { SearchButton } from "./SearchButton"

/**
 * Only cached public reads here — never cookies — so every page that uses
 * this navbar can be prerendered. The signed-in parts are client components
 * that read the session after load (see useSessionUser).
 */
export async function Navbar() {
  const [categoriesRes, brandsRes, featuredRes] = await Promise.all([
    getCategories(),
    getBrands(),
    getFeaturedGear(1),
  ])

  const categories: NavCategory[] = (categoriesRes.data ?? []).map(
    (category) => ({
      id: category.id,
      name: category.name,
      count: category._count?.gearItems ?? 0,
    })
  )
  const brands = brandsRes.data ?? []
  const gear = featuredRes.data?.data?.[0]
  const featured: NavFeatured | null = gear
    ? {
        id: gear.id,
        name: gear.name,
        imageUrl: gear.imageUrl,
        pricePerDay: gear.pricePerDay,
        category: gear.category?.name,
      }
    : null

  return (
    <NavbarShell>
      {/* Wider than the page (7xl): the bar carries the direct links. */}
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 transition-[height] duration-300 group-data-[scrolled=true]/nav:h-16 lg:gap-5">
        <Logo />

        <DesktopNav
          categories={categories}
          brands={brands}
          featured={featured}
        />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchButton compact />
          {/* In the mobile menu sheet below sm, so the header fits. */}
          <div className="hidden items-center gap-2 sm:flex">
            <LocaleSwitcher compact />
            <ThemeToggle />
          </div>
          <AccountArea />
          <MobileNav categories={categories} />
        </div>
      </div>

      <CommandPalette categories={categories} askAi />
    </NavbarShell>
  )
}

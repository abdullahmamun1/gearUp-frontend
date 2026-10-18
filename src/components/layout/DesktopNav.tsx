"use client"

import Image from "next/image"
import { Link as NextLink, usePathname } from "@/i18n/navigation"
import { useState } from "react"
import { NavigationMenu } from "@base-ui/react/navigation-menu"
import { motion } from "motion/react"
import { useTranslations } from "@/i18n/translations"
import {
  ArrowRight,
  Backpack,
  ChevronDown,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react"

import { openGearFinder } from "@/components/modules/ai/GearFinder"
import { categoryIcon } from "@/constants/categoryIcons"
import {
  COMPANY_NAV,
  PUBLIC_LINKS,
  QUICK_FILTERS,
  ROLE_LINKS,
  type NavItem,
  type NavLink,
} from "@/constants/navigation"
import { SITE_CONTACT } from "@/constants/siteConfig"
import { useSessionUser } from "@/hooks/useSessionUser"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"

import { useQuickFilterLabel } from "./useQuickFilterLabel"

export type NavCategory = { id: string; name: string; count: number }
export type NavFeatured = {
  id: string
  name: string
  imageUrl?: string
  pricePerDay: string
  category?: string
}

/** "company" is the "More" menu: shown only below `lg` (tablets), where
 *  the About, Help and Contact links don't fit as direct links. */
const MENUS = ["browse", "company"] as const

/**
 * Desktop mega menu on Base UI's NavigationMenu: hover or click a trigger to
 * open its panel. The panel resizes smoothly between menus, and a pill slides
 * under whichever trigger is hovered or open. Fully keyboard accessible.
 */
export function DesktopNav({
  categories,
  brands,
  featured,
}: {
  categories: NavCategory[]
  brands: string[]
  featured: NavFeatured | null
}) {
  const t = useTranslations("nav.menus")
  const tLinks = useTranslations("nav.links")
  const role = useSessionUser().user?.role ?? null
  const [open, setOpen] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const highlighted = hovered ?? open

  return (
    <NavigationMenu.Root
      value={open}
      onValueChange={(value) => setOpen((value as string | null) ?? null)}
      delay={80}
      closeDelay={120}
      className="hidden md:block"
    >
      <NavigationMenu.List
        className="relative flex items-center gap-0.5"
        onPointerLeave={() => setHovered(null)}
      >
        {MENUS.map((menu) => (
          <NavigationMenu.Item
            key={menu}
            value={menu}
            onPointerEnter={() => setHovered(menu)}
            className={cn(menu === "company" && "lg:hidden")}
          >
            <NavigationMenu.Trigger
              className="relative isolate flex h-11 cursor-pointer items-center gap-1 rounded-full px-3.5 text-base font-medium whitespace-nowrap text-foreground/80 transition-colors outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:text-foreground"
              onFocus={() => setHovered(menu)}
              onBlur={() => setHovered(null)}
            >
              {highlighted === menu && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {menu === "company" ? tLinks("more") : t(menu)}
              <NavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
                <ChevronDown className="size-4 opacity-60" aria-hidden />
              </NavigationMenu.Icon>
            </NavigationMenu.Trigger>

            <NavigationMenu.Content className={contentClass}>
              {menu === "browse" && (
                <BrowsePanel
                  categories={categories}
                  brands={brands}
                  featured={featured}
                />
              )}
              {menu === "company" && <CompanyPanel />}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
        {PUBLIC_LINKS.map((link) => (
          <TopLink key={link.key} link={link} className="hidden lg:flex" />
        ))}
        {/* After the public links, so they don't move when the session loads.
            Customers also get the saved/messages counters, which leave no
            room for these at lg; the account menu links there anyway. */}
        {role &&
          ROLE_LINKS[role].map((link) => (
            <TopLink
              key={link.key}
              link={link}
              className={
                role === "CUSTOMER" ? "hidden xl:flex" : "hidden lg:flex"
              }
            />
          ))}
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={14}
          collisionPadding={{ top: 8, bottom: 8, left: 16, right: 16 }}
          collisionAvoidance={{ side: "none" }}
          className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration) ease-(--easing) data-instant:transition-none"
          style={{
            ["--duration" as string]: "0.35s",
            ["--easing" as string]: "var(--ease-out-soft)",
          }}
        >
          <NavigationMenu.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-xl backdrop-blur-xl transition-[opacity,transform,width,height,scale] duration-(--duration) ease-(--easing) data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  )
}

const contentClass =
  "h-full w-[min(46rem,calc(100vw-2rem))] p-5 transition-[opacity,translate] duration-(--duration) ease-(--easing) data-starting-style:opacity-0 data-ending-style:opacity-0 data-starting-style:data-[activation-direction=left]:-translate-x-1/4 data-starting-style:data-[activation-direction=right]:translate-x-1/4 data-ending-style:data-[activation-direction=left]:translate-x-1/4 data-ending-style:data-[activation-direction=right]:-translate-x-1/4 motion-reduce:transition-none"

function MenuLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <NavigationMenu.Link
      closeOnClick
      render={<NextLink href={href} />}
      className={cn(
        "rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children}
    </NavigationMenu.Link>
  )
}

/** A direct link in the bar (no panel), highlighted on its own pages. */
function TopLink({ link, className }: { link: NavLink; className?: string }) {
  const t = useTranslations("nav.links")
  const pathname = usePathname()
  const active =
    pathname === link.href ||
    (link.href !== "/" && pathname.startsWith(`${link.href}/`))

  return (
    <NavigationMenu.Item className={cn("flex", className)}>
      <NavigationMenu.Link
        render={<NextLink href={link.href} />}
        active={active}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-11 items-center rounded-full px-3.5 text-base font-medium whitespace-nowrap text-foreground/80 transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-primary hover:text-primary"
        )}
      >
        {t(link.key)}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-2 text-eyebrow text-muted-foreground">{children}</p>
  )
}

function BrowsePanel({
  categories,
  brands,
  featured,
}: {
  categories: NavCategory[]
  brands: string[]
  featured: NavFeatured | null
}) {
  const t = useTranslations("nav.browse")
  const format = useFormat()
  const quickFilterLabel = useQuickFilterLabel()

  return (
    <div className="grid gap-6 md:grid-cols-[1.25fr_1fr_0.95fr]">
      <div>
        <Heading>{t("categories")}</Heading>
        <ul className="grid gap-0.5">
          {categories.map((category) => {
            const Icon = categoryIcon(category.name)
            return (
              <li key={category.id}>
                <MenuLink
                  href={`/gear?category=${category.id}`}
                  className="group flex items-center gap-3 px-2 py-2 transition-colors hover:bg-accent"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {format.number(category.count)}
                  </span>
                </MenuLink>
              </li>
            )
          })}
        </ul>
        <MenuLink
          href="/gear"
          className="group mt-2 inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-primary"
        >
          {t("browseAll")}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </MenuLink>
      </div>

      <div>
        <Heading>{t("popularBrands")}</Heading>
        <div className="flex flex-wrap gap-1.5 px-2">
          {brands.slice(0, 10).map((brand) => (
            <MenuLink
              key={brand}
              href={`/gear?brand=${encodeURIComponent(brand)}`}
              className="rounded-full border bg-card px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {brand}
            </MenuLink>
          ))}
        </div>
        <div className="mt-5">
          <Heading>{t("quickFilters")}</Heading>
          <ul className="grid gap-0.5">
            {QUICK_FILTERS.map((filter) => (
              <li key={filter.href}>
                <MenuLink
                  href={filter.href}
                  className="flex items-center gap-2.5 px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <filter.icon className="size-4 text-lagoon" aria-hidden />
                  {quickFilterLabel(filter)}
                </MenuLink>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => openGearFinder()}
          className="group mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
            <Sparkles
              className="size-4 transition-transform group-hover:rotate-12"
              aria-hidden
            />
          </span>
          <span>
            <span className="block text-sm font-semibold">{t("planTrip")}</span>
            <span className="block text-xs text-muted-foreground">
              {t("planTripHint")}
            </span>
          </span>
        </button>
      </div>

      {featured ? (
        <MenuLink
          href={`/gear/${featured.id}`}
          className="group flex flex-col self-start overflow-hidden border bg-card shadow-xs transition-shadow hover:shadow-md"
        >
          <span className="relative block aspect-4/3 overflow-hidden bg-muted">
            {featured.imageUrl ? (
              <Image
                src={featured.imageUrl}
                alt=""
                fill
                sizes="240px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Backpack
                className="absolute inset-0 m-auto size-8 text-primary/30"
                aria-hidden
              />
            )}
            <span className="absolute top-2 left-2 rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold text-ember-foreground">
              {t("newIn")}
            </span>
          </span>
          <span className="grid gap-0.5 p-3">
            <span className="truncate text-sm font-semibold">
              {featured.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {featured.category && `${featured.category} · `}
              {t("pricePerDay", { price: format.price(featured.pricePerDay) })}
            </span>
          </span>
        </MenuLink>
      ) : (
        <span />
      )}
    </div>
  )
}

function ItemList({ items }: { items: NavItem[] }) {
  const t = useTranslations("nav.items")

  return (
    <ul className="grid gap-1">
      {items.map((item) => (
        <li key={item.href}>
          <MenuLink
            href={item.href}
            className="group flex items-start gap-3 p-2.5 transition-colors hover:bg-accent"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-card text-primary shadow-xs transition-transform group-hover:scale-105">
              <item.icon className="size-[18px]" aria-hidden />
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-semibold">
                {t(`${item.key}.title`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`${item.key}.description`)}
              </span>
            </span>
          </MenuLink>
        </li>
      ))}
    </ul>
  )
}

function CompanyPanel() {
  const t = useTranslations("nav.company")

  return (
    <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
      <div>
        <Heading>GearUp</Heading>
        <ItemList items={COMPANY_NAV} />
      </div>
      <div className="rounded-2xl border bg-card p-4 shadow-xs">
        <p className="text-sm font-semibold">{t("talkTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("talkBody")}</p>
        <ul className="mt-3 grid gap-2 text-xs">
          <li className="flex items-center gap-2">
            <Mail className="size-3.5 text-primary" aria-hidden />
            <span className="truncate">{SITE_CONTACT.email}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" aria-hidden />
            {t("location")}
          </li>
        </ul>
      </div>
    </div>
  )
}

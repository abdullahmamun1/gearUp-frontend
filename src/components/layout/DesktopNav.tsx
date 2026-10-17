"use client"

import Image from "next/image"
import NextLink from "next/link"
import { useState } from "react"
import { NavigationMenu } from "@base-ui/react/navigation-menu"
import { motion } from "motion/react"
import { ArrowRight, Backpack, ChevronDown, MapPin, Mail } from "lucide-react"

import { categoryIcon } from "@/constants/categoryIcons"
import {
  COMPANY_NAV,
  PROVIDER_DASHBOARD_NAV,
  PROVIDER_NAV,
  QUICK_FILTERS,
  type NavItem,
} from "@/constants/navigation"
import { SITE_CONTACT } from "@/constants/siteConfig"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/utils/format"
import type { Role } from "@/types"

export type NavCategory = { id: string; name: string; count: number }
export type NavFeatured = {
  id: string
  name: string
  imageUrl?: string
  pricePerDay: string
  category?: string
}

const MENUS = [
  { key: "browse", label: "Browse" },
  { key: "providers", label: "For providers" },
  { key: "company", label: "Company" },
] as const

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
            key={menu.key}
            value={menu.key}
            onPointerEnter={() => setHovered(menu.key)}
          >
            <NavigationMenu.Trigger
              className="relative isolate flex h-11 cursor-pointer items-center gap-1 rounded-full px-4 text-base font-medium text-foreground/80 transition-colors outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:text-foreground"
              onFocus={() => setHovered(menu.key)}
              onBlur={() => setHovered(null)}
            >
              {highlighted === menu.key && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {menu.label}
              <NavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
                <ChevronDown className="size-4 opacity-60" aria-hidden />
              </NavigationMenu.Icon>
            </NavigationMenu.Trigger>

            <NavigationMenu.Content className={contentClass}>
              {menu.key === "browse" && (
                <BrowsePanel
                  categories={categories}
                  brands={brands}
                  featured={featured}
                />
              )}
              {menu.key === "providers" && <ProvidersPanel role={role} />}
              {menu.key === "company" && <CompanyPanel />}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
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
  return (
    <div className="grid gap-6 md:grid-cols-[1.25fr_1fr_0.95fr]">
      <div>
        <Heading>Categories</Heading>
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
                    {category.count}
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
          Browse all gear
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </MenuLink>
      </div>

      <div>
        <Heading>Popular brands</Heading>
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
          <Heading>Quick filters</Heading>
          <ul className="grid gap-0.5">
            {QUICK_FILTERS.map((filter) => (
              <li key={filter.href}>
                <MenuLink
                  href={filter.href}
                  className="flex items-center gap-2.5 px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <filter.icon className="size-4 text-lagoon" aria-hidden />
                  {filter.label}
                </MenuLink>
              </li>
            ))}
          </ul>
        </div>
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
              New in
            </span>
          </span>
          <span className="grid gap-0.5 p-3">
            <span className="truncate text-sm font-semibold">
              {featured.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {featured.category && `${featured.category} · `}
              {formatPrice(featured.pricePerDay)} / day
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
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </span>
          </MenuLink>
        </li>
      ))}
    </ul>
  )
}

function ProvidersPanel({ role }: { role: Role | null }) {
  const items =
    role === "PROVIDER"
      ? [PROVIDER_DASHBOARD_NAV, ...PROVIDER_NAV.slice(1)]
      : PROVIDER_NAV

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
      <div>
        <Heading>Rent out your kit</Heading>
        <ItemList items={items} />
      </div>
      <MenuLink
        href="/#earn"
        className="flex flex-col justify-between gap-6 bg-(image:--gradient-brand) p-5 text-primary-foreground shadow-md"
      >
        <span className="text-sm opacity-90">
          Two tents, rented 8 days a month
        </span>
        <span>
          <span className="block text-h2 tabular-nums">
            {formatPrice(12800)}
          </span>
          <span className="text-sm opacity-90">a month, roughly</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          Try the earnings calculator
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </MenuLink>
    </div>
  )
}

function CompanyPanel() {
  return (
    <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
      <div>
        <Heading>GearUp</Heading>
        <ItemList items={COMPANY_NAV} />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-sm font-semibold">Talk to a person</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Group bookings, provider questions or problems with a rental — we
          reply within a day.
        </p>
        <ul className="mt-3 grid gap-2 text-xs">
          <li className="flex items-center gap-2">
            <Mail className="size-3.5 text-primary" aria-hidden />
            <span className="truncate">{SITE_CONTACT.email}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" aria-hidden />
            {SITE_CONTACT.location}
          </li>
        </ul>
      </div>
    </div>
  )
}

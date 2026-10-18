import {
  BadgeDollarSign,
  CalendarCheck,
  CircleHelp,
  Compass,
  Info,
  Mail,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "@/types"

/**
 * Menu content. Titles and descriptions are translated where they're
 * rendered: `t(\`items.${item.key}.title\`)` in the `nav` namespace.
 */
export type NavItemKey = "about" | "howItWorks" | "faq" | "contact"

export type NavItem = {
  key: NavItemKey
  href: string
  icon: LucideIcon
}

/** "Company" links (mobile menu and the "More" menu). */
export const COMPANY_NAV: NavItem[] = [
  { key: "about", href: "/about", icon: Info },
  { key: "howItWorks", href: "/#how-it-works", icon: Compass },
  { key: "faq", href: "/help", icon: CircleHelp },
  { key: "contact", href: "/contact", icon: Mail },
]

/**
 * Direct links in the navbar, labels in `nav.links`. Public pages for
 * everyone; each role adds its dashboard and main page. Below `lg` the
 * public links fold into the "More" menu.
 */
export type NavLinkKey =
  | "about"
  | "help"
  | "contact"
  | "dashboard"
  | "myRentals"
  | "orders"
  | "analytics"

export type NavLink = { key: NavLinkKey; href: string }

export const PUBLIC_LINKS: NavLink[] = [
  { key: "about", href: "/about" },
  { key: "help", href: "/help" },
  { key: "contact", href: "/contact" },
]

export const ROLE_LINKS: Record<Role, NavLink[]> = {
  CUSTOMER: [
    { key: "dashboard", href: "/dashboard/customer" },
    { key: "myRentals", href: "/dashboard/customer/orders" },
  ],
  PROVIDER: [
    { key: "dashboard", href: "/dashboard/provider" },
    { key: "orders", href: "/dashboard/provider/orders" },
  ],
  ADMIN: [
    { key: "dashboard", href: "/dashboard/admin" },
    { key: "analytics", href: "/dashboard/admin/analytics" },
  ],
}

/**
 * Quick filters in the "Browse" menu and the command palette. The label is
 * `t(\`quickFilters.${filter.key}\`, { price })` (see useQuickFilterLabel).
 */
export const QUICK_FILTERS = [
  {
    key: "availableToday",
    href: "/gear?isAvailable=true",
    icon: CalendarCheck,
  },
  {
    key: "underPrice",
    price: 500,
    href: "/gear?maxPrice=500",
    icon: BadgeDollarSign,
  },
] as const

export type QuickFilter = (typeof QUICK_FILTERS)[number]

import {
  BadgeDollarSign,
  CalendarCheck,
  CircleHelp,
  Compass,
  Info,
  LayoutDashboard,
  Mail,
  PackagePlus,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

/** "For providers" menu. The dashboard link is added for providers only. */
export const PROVIDER_NAV: NavItem[] = [
  {
    title: "List your gear",
    description: "Create a free provider account and publish a listing.",
    href: "/register?role=PROVIDER",
    icon: PackagePlus,
  },
  {
    title: "How earning works",
    description: "Set your price, confirm bookings, get paid by card.",
    href: "/#earn",
    icon: BadgeDollarSign,
  },
]

export const PROVIDER_DASHBOARD_NAV: NavItem = {
  title: "Provider dashboard",
  description: "Your listings, bookings and returns.",
  href: "/dashboard/provider",
  icon: LayoutDashboard,
}

/** "Company" menu. */
export const COMPANY_NAV: NavItem[] = [
  {
    title: "About GearUp",
    description: "Why we built a rental marketplace for Bangladesh.",
    href: "/about",
    icon: Info,
  },
  {
    title: "How it works",
    description: "From browsing to the trailhead in three steps.",
    href: "/#how-it-works",
    icon: Compass,
  },
  {
    title: "FAQ",
    description: "Deposits, cancellations, pickups and more.",
    href: "/#faq",
    icon: CircleHelp,
  },
  {
    title: "Contact",
    description: "Questions, group bookings or feedback.",
    href: "/contact",
    icon: Mail,
  },
]

/** Quick filters in the "Browse" menu and the command palette. */
export const QUICK_FILTERS = [
  {
    label: "Available today",
    href: "/gear?isAvailable=true",
    icon: CalendarCheck,
  },
  {
    label: "Under ৳500 / day",
    href: "/gear?maxPrice=500",
    icon: BadgeDollarSign,
  },
] as const

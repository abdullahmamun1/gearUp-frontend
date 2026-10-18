import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Heart,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquareWarning,
  PackageCheck,
  ShieldAlert,
  Tags,
  UserRound,
  Users,
} from "lucide-react"

import { DASHBOARD_HOME, PROFILE_HOME } from "@/routes"
import type { Role, SidebarItem } from "@/types"

const { CUSTOMER, PROVIDER, ADMIN } = DASHBOARD_HOME

/** Keys of `nav.sidebar.items`; translated where they're rendered. */
export type SidebarLabel =
  | "overview"
  | "myRentals"
  | "saved"
  | "payments"
  | "profile"
  | "myGear"
  | "orders"
  | "analytics"
  | "users"
  | "gear"
  | "rentals"
  | "damageClaims"
  | "reviews"
  | "inbox"
  | "subscribers"
  | "categories"

export type NavSidebarItem = Omit<SidebarItem, "label"> & {
  label: SidebarLabel
}

export const SIDEBAR_ITEMS: Record<Role, NavSidebarItem[]> = {
  CUSTOMER: [
    { label: "overview", href: CUSTOMER, icon: LayoutDashboard },
    {
      label: "myRentals",
      href: `${CUSTOMER}/orders`,
      icon: PackageCheck,
      badge: "messages",
    },
    { label: "saved", href: `${CUSTOMER}/saved`, icon: Heart },
    { label: "payments", href: `${CUSTOMER}/payments`, icon: CreditCard },
    { label: "profile", href: PROFILE_HOME.CUSTOMER, icon: UserRound },
  ],
  PROVIDER: [
    { label: "overview", href: PROVIDER, icon: LayoutDashboard },
    { label: "myGear", href: `${PROVIDER}/gear`, icon: Boxes },
    {
      label: "orders",
      href: `${PROVIDER}/orders`,
      icon: ClipboardList,
      badge: "messages",
    },
    { label: "profile", href: PROFILE_HOME.PROVIDER, icon: UserRound },
  ],
  ADMIN: [
    { label: "overview", href: ADMIN, icon: LayoutDashboard },
    { label: "analytics", href: `${ADMIN}/analytics`, icon: BarChart3 },
    { label: "users", href: `${ADMIN}/users`, icon: Users },
    { label: "gear", href: `${ADMIN}/gear`, icon: Boxes },
    { label: "rentals", href: `${ADMIN}/rentals`, icon: ClipboardList },
    {
      label: "damageClaims",
      href: `${ADMIN}/claims`,
      icon: ShieldAlert,
      badge: "claims",
    },
    {
      label: "reviews",
      href: `${ADMIN}/reviews`,
      icon: MessageSquareWarning,
    },
    { label: "inbox", href: `${ADMIN}/inbox`, icon: Inbox, badge: "inbox" },
    { label: "subscribers", href: `${ADMIN}/subscribers`, icon: Mail },
    { label: "categories", href: `${ADMIN}/categories`, icon: Tags },
    { label: "profile", href: PROFILE_HOME.ADMIN, icon: UserRound },
  ],
}

import {
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PackageCheck,
  Tags,
  UserRound,
  Users,
} from "lucide-react"

import type { Role, SidebarItem } from "@/types"

export const SIDEBAR_ITEMS: Record<Role, SidebarItem[]> = {
  CUSTOMER: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My rentals", href: "/dashboard/orders", icon: PackageCheck },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  ],
  PROVIDER: [
    { label: "Overview", href: "/provider-dashboard", icon: LayoutDashboard },
    { label: "My gear", href: "/provider-dashboard/gear", icon: Boxes },
    {
      label: "Orders",
      href: "/provider-dashboard/orders",
      icon: ClipboardList,
    },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin-dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin-dashboard/users", icon: Users },
    { label: "Gear", href: "/admin-dashboard/gear", icon: Boxes },
    { label: "Rentals", href: "/admin-dashboard/rentals", icon: ClipboardList },
    { label: "Categories", href: "/admin-dashboard/categories", icon: Tags },
  ],
}

export const DASHBOARD_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  PROVIDER: "/provider-dashboard",
  ADMIN: "/admin-dashboard",
}

export const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Provider",
  ADMIN: "Administrator",
}

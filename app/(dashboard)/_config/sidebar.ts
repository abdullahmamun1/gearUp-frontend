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

import { DASHBOARD_HOME, PROFILE_HOME } from "@/lib/routes"
import type { Role, SidebarItem } from "@/types"

const { CUSTOMER, PROVIDER, ADMIN } = DASHBOARD_HOME

export const SIDEBAR_ITEMS: Record<Role, SidebarItem[]> = {
  CUSTOMER: [
    { label: "Overview", href: CUSTOMER, icon: LayoutDashboard },
    { label: "My rentals", href: `${CUSTOMER}/orders`, icon: PackageCheck },
    { label: "Payments", href: `${CUSTOMER}/payments`, icon: CreditCard },
    { label: "Profile", href: PROFILE_HOME.CUSTOMER, icon: UserRound },
  ],
  PROVIDER: [
    { label: "Overview", href: PROVIDER, icon: LayoutDashboard },
    { label: "My gear", href: `${PROVIDER}/gear`, icon: Boxes },
    { label: "Orders", href: `${PROVIDER}/orders`, icon: ClipboardList },
    { label: "Profile", href: PROFILE_HOME.PROVIDER, icon: UserRound },
  ],
  ADMIN: [
    { label: "Overview", href: ADMIN, icon: LayoutDashboard },
    { label: "Users", href: `${ADMIN}/users`, icon: Users },
    { label: "Gear", href: `${ADMIN}/gear`, icon: Boxes },
    { label: "Rentals", href: `${ADMIN}/rentals`, icon: ClipboardList },
    { label: "Categories", href: `${ADMIN}/categories`, icon: Tags },
    { label: "Profile", href: PROFILE_HOME.ADMIN, icon: UserRound },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Provider",
  ADMIN: "Administrator",
}

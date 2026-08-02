"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mountain } from "lucide-react"

import { useRequiredSession } from "@/components/providers/SessionProvider"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { ROLE_LABEL, SIDEBAR_ITEMS } from "../_config/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { role } = useRequiredSession()
  const items = SIDEBAR_ITEMS[role]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="GearUp"
              render={<Link href="/" />}
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10">
                <Mountain className="size-4 text-primary" aria-hidden />
              </div>
              <div className="grid text-left leading-tight">
                <span className="font-heading text-sm font-bold">GearUp</span>
                <span className="text-xs text-muted-foreground">
                  {ROLE_LABEL[role]}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(pathname, item.href, items)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon aria-hidden />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

function isActive(pathname: string, href: string, items: { href: string }[]) {
  const isOverview = items.every(
    (item) => item.href === href || item.href.startsWith(`${href}/`)
  )

  return isOverview ? pathname === href : pathname.startsWith(href)
}

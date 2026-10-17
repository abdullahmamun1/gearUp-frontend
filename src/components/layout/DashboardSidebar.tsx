"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { ChevronsUpDown, Home, LogOut, Mountain, UserRound } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/hooks/useSessionUser"
import { PROFILE_HOME } from "@/routes"

import { useRequiredSession } from "@/providers/SessionProvider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { ROLE_LABEL, SIDEBAR_ITEMS } from "@/constants/sidebar"

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
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-(image:--gradient-brand) shadow-glow-primary">
                <Mountain
                  className="size-5 text-primary-foreground"
                  aria-hidden
                />
              </div>
              <div className="grid text-left leading-tight">
                <span className="font-heading text-base font-bold">GearUp</span>
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

      <SidebarFooter className="border-t">
        <SidebarAccount />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/** The signed-in account, pinned to the bottom of the sidebar. */
function SidebarAccount() {
  const user = useRequiredSession()
  const logout = useLogout()
  const [isPending, startTransition] = useTransition()
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={user.name}
                aria-label="Account menu"
                className="data-popup-open:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-9 rounded-xl ring-2 ring-primary/20">
              <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronsUpDown className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-64">
            <div className="grid gap-0.5 px-2.5 py-2">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={PROFILE_HOME[user.role]} />}>
              <UserRound aria-hidden />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/" />}>
              <Home aria-hidden />
              Back to site
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              closeOnClick={false}
              onClick={() => startTransition(async () => await logout())}
            >
              <LogOut aria-hidden />
              {isPending ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function isActive(pathname: string, href: string, items: { href: string }[]) {
  const isOverview = items.every(
    (item) => item.href === href || item.href.startsWith(`${href}/`)
  )

  return isOverview ? pathname === href : pathname.startsWith(href)
}

"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Home, LayoutDashboard, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/service/auth"
import type { JwtUser } from "@/types"

/**
 * Icon components can't cross the server/client boundary as props, so callers
 * name an icon and we resolve it on this side.
 */
const ICONS = { dashboard: LayoutDashboard, home: Home } as const

export type AccountMenuLink = {
  label: string
  href: string
  icon: keyof typeof ICONS
}

export function AccountMenu({
  user,
  links,
}: {
  user: JwtUser
  links: AccountMenuLink[]
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2"
            aria-label="Account menu"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm sm:inline">{user.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Not DropdownMenuLabel: base-ui's Menu.GroupLabel throws without a
            Menu.Group ancestor, and this heading labels the account, not a
            group of items. */}
        <div className="grid gap-0.5 px-2 py-1.5">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </div>

        <DropdownMenuSeparator />

        {links.map((link) => {
          const Icon = ICONS[link.icon]

          return (
            <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
              <Icon aria-hidden />
              {link.label}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isPending}
          closeOnClick={false}
          onClick={() =>
            startTransition(async () => {
              await logout()
            })
          }
          variant="destructive"
        >
          <LogOut aria-hidden />
          {isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

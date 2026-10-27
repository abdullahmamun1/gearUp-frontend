"use client"

import { Link } from "@/i18n/navigation"
import { useTransition } from "react"
import { Home, LayoutDashboard, LogOut, UserRound } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { UserAvatar } from "@/components/shared/UserAvatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InstallAppMenuItem } from "@/components/shared/InstallAppMenuItem"
import { useLogout } from "@/hooks/useSessionUser"
import type { JwtUser } from "@/types"

const ICONS = {
  dashboard: LayoutDashboard,
  home: Home,
  profile: UserRound,
} as const

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
  const t = useTranslations("nav.account")
  const [isPending, startTransition] = useTransition()
  const logout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-11 gap-2 rounded-full px-1 2xl:pr-3"
            aria-label={t("menu")}
          />
        }
      >
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          className="size-8 ring-2 ring-primary/25"
        />
        <span className="hidden text-sm 2xl:inline">{user.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
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
            <DropdownMenuItem
              key={link.href}
              render={<Link href={link.href} />}
            >
              <Icon aria-hidden />
              {link.label}
            </DropdownMenuItem>
          )
        })}
        <InstallAppMenuItem />

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
          {isPending ? t("loggingOut") : t("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

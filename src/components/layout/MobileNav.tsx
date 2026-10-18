"use client"

import { Link } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { useTranslations } from "@/i18n/translations"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react"

import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { categoryIcon } from "@/constants/categoryIcons"
import { PUBLIC_LINKS, QUICK_FILTERS, ROLE_LINKS } from "@/constants/navigation"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import { DASHBOARD_HOME, PROFILE_HOME } from "@/routes"
import { useLogout, useSessionUser } from "@/hooks/useSessionUser"

import { openGearFinder } from "@/components/modules/ai/GearFinder"

import { openCommandPalette } from "./CommandPalette"
import type { NavCategory } from "./DesktopNav"
import { Logo } from "./Logo"
import { useQuickFilterLabel } from "./useQuickFilterLabel"

/** Full-height menu for phones and small tablets. */
export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const t = useTranslations("nav")
  const format = useFormat()
  const quickFilterLabel = useQuickFilterLabel()
  const { user } = useSessionUser()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const close = () => setOpen(false)

  const linkClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors hover:bg-accent"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-11 rounded-full md:hidden"
            aria-label={t("mobile.openMenu")}
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle render={<div />}>
            <Logo onClick={close} />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <button
            type="button"
            onClick={() => {
              close()
              openCommandPalette()
            }}
            className="mx-2 mb-3 flex h-11 w-[calc(100%-1rem)] items-center gap-2.5 rounded-xl border bg-card px-3.5 text-[15px] text-muted-foreground shadow-xs"
          >
            <Search className="size-4" aria-hidden />
            {t("search.mobile")}
          </button>

          <button
            type="button"
            onClick={() => {
              close()
              openGearFinder()
            }}
            className={cn(linkClass, "w-full text-left font-semibold")}
          >
            <span className="grid size-7 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            {t("browse.planTrip")}
          </button>

          <Link
            href="/gear"
            onClick={close}
            className={cn(linkClass, "font-semibold")}
          >
            {t("browse.browseAll")}
          </Link>

          {/* The same direct routes as the desktop bar. */}
          {[...(user ? ROLE_LINKS[user.role] : []), ...PUBLIC_LINKS].map(
            (link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={close}
                className={cn(linkClass, "font-semibold")}
              >
                {t(`links.${link.key}`)}
              </Link>
            )
          )}

          <Accordion className="mt-1">
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="px-3 py-2.5 text-[15px] hover:no-underline">
                {t("browse.categories")}
              </AccordionTrigger>
              <AccordionPanel>
                <ul className="grid gap-0.5 pb-2">
                  {categories.map((category) => {
                    const Icon = categoryIcon(category.name)
                    return (
                      <li key={category.id}>
                        <Link
                          href={`/gear?category=${category.id}`}
                          onClick={close}
                          className={linkClass}
                        >
                          <Icon
                            className="size-[18px] text-primary"
                            aria-hidden
                          />
                          <span className="flex-1">{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format.number(category.count)}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                  {QUICK_FILTERS.map((filter) => (
                    <li key={filter.href}>
                      <Link
                        href={filter.href}
                        onClick={close}
                        className={linkClass}
                      >
                        <filter.icon
                          className="size-[18px] text-lagoon"
                          aria-hidden
                        />
                        {quickFilterLabel(filter)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="grid gap-3 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {t("mobile.appearance")}
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          {user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={DASHBOARD_HOME[user.role]}
                onClick={close}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 gap-2 text-sm"
                )}
              >
                <LayoutDashboard className="size-4" aria-hidden />
                {t("account.dashboard")}
              </Link>
              <Link
                href={PROFILE_HOME[user.role]}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 gap-2 text-sm"
                )}
              >
                <UserRound className="size-4" aria-hidden />
                {t("account.profile")}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                disabled={isPending}
                onClick={() => startTransition(() => logout())}
                className="col-span-2 h-10 gap-2 text-sm text-muted-foreground"
              >
                <LogOut className="size-4" aria-hidden />
                {t("account.logOut")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 text-sm"
                )}
              >
                {t("account.logIn")}
              </Link>
              <Link
                href="/register"
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "h-11 text-sm"
                )}
              >
                {t("account.signUp")}
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

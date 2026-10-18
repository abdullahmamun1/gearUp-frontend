"use client"

import Image from "next/image"
import { useRouter } from "@/i18n/navigation"
import { useEffect, useState, useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { Command, defaultFilter } from "cmdk"
import {
  ArrowRight,
  Backpack,
  CornerDownLeft,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  Search,
  Sparkles,
  Sun,
  UserPlus,
} from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { useTheme } from "next-themes"

import { getGearList } from "@/api/gear"
import { openGearFinder } from "@/components/modules/ai/GearFinder"
import { useLogout, useSessionUser } from "@/hooks/useSessionUser"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { categoryIcon } from "@/constants/categoryIcons"
import { COMPANY_NAV, QUICK_FILTERS } from "@/constants/navigation"
import { SIDEBAR_ITEMS } from "@/constants/sidebar"
import { useFormat } from "@/i18n/useFormat"
import type { Role } from "@/types"

import { useQuickFilterLabel } from "./useQuickFilterLabel"

const OPEN_EVENT = "gearup:command-palette"

/**
 * Gear results were already matched by the server (name, brand, description),
 * so they always show, first; "see all" follows them. Everything else is
 * fuzzy-matched locally.
 */
function paletteFilter(value: string, search: string, keywords?: string[]) {
  if (value.startsWith("gear:")) return 1
  if (value.startsWith("all:")) return 0.99
  // "Ask AI" always applies (it takes whatever was typed as the question),
  // but ranks below real matches so Enter still opens the best gear result.
  if (value.startsWith("ai:")) return 0.2
  return defaultFilter(value, search, keywords) * 0.98
}

/** Opens the palette from anywhere, e.g. a search button. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export type PaletteCategory = { id: string; name: string; count: number }

/**
 * ⌘K / Ctrl+K (or "/") palette: live gear search, categories, pages, the
 * signed-in user's dashboard pages, and a few actions. Mount it once per
 * layout.
 */
export function CommandPalette({
  categories,
  role: roleProp,
  askAi = false,
}: {
  categories: PaletteCategory[]
  /** Offer "Ask the trip planner" (only where GearFinder is mounted). */
  askAi?: boolean
  /** Known on server-rendered pages (dashboards); otherwise read client-side. */
  role?: Role | null
}) {
  const t = useTranslations("nav")
  const format = useFormat()
  const quickFilterLabel = useQuickFilterLabel()
  const { user } = useSessionUser()
  const role = roleProp !== undefined ? roleProp : (user?.role ?? null)
  const logout = useLogout()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [term, setTerm] = useState("")
  const [, startTransition] = useTransition()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  // Debounce the remote search so typing "kayak" sends one request, not five.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 220)
    return () => clearTimeout(timer)
  }, [query])

  const search = useQuery({
    queryKey: ["palette-search", term],
    queryFn: () => getGearList({ searchTerm: term, limit: "6" }),
    enabled: open && term.length >= 2,
    staleTime: 60 * 1000,
  })
  // Only show results for what's in the box now — never a previous search.
  const current = term === query.trim()
  const results = current && search.data?.success ? search.data.data.data : []

  function close() {
    setOpen(false)
    setQuery("")
    setTerm("")
  }

  function go(href: string) {
    close()
    startTransition(() => router.push(href))
  }

  function run(action: () => void) {
    close()
    action()
  }

  const itemClass =
    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
  const groupClass =
    "px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:text-muted-foreground"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setOpen(true)
        else close()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">{t("palette.title")}</DialogTitle>
        <Command label={t("palette.title")} loop filter={paletteFilter}>
          <div className="flex items-center gap-3 border-b px-4">
            <Search
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={t("palette.placeholder")}
              className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {search.isFetching && (
              <Loader2
                className="size-4 shrink-0 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain py-1">
            <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
              {term.length >= 2 && search.isFetching
                ? t("palette.searching")
                : t("palette.empty")}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group
                heading={t("palette.groups.gear")}
                className={groupClass}
              >
                {results.map((gear) => (
                  <Command.Item
                    key={gear.id}
                    value={`gear:${gear.id}`}
                    onSelect={() => go(`/gear/${gear.id}`)}
                    className={itemClass}
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {gear.imageUrl ? (
                        <Image
                          src={gear.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <Backpack
                          className="absolute inset-0 m-auto size-4 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {gear.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[gear.brand, gear.category?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {format.price(gear.pricePerDay)}
                      <span className="text-muted-foreground">
                        {t("palette.perDay")}
                      </span>
                    </span>
                  </Command.Item>
                ))}
                {term.length >= 2 && (
                  <Command.Item
                    value={`all:${term}`}
                    onSelect={() =>
                      go(`/gear?searchTerm=${encodeURIComponent(term)}`)
                    }
                    className={itemClass}
                  >
                    <Search
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {t("palette.seeAll", { term })}
                  </Command.Item>
                )}
              </Command.Group>
            )}

            {/* Shown once the live search has settled: cmdk keeps whatever
                is selected, so appearing earlier would steal the selection
                from the gear results that arrive a moment later. */}
            {askAi && term === query.trim() && !search.isFetching && (
              <Command.Group
                heading={t("palette.groups.ai")}
                className={groupClass}
              >
                <Command.Item
                  value={`ai:${query}`}
                  keywords={[
                    "ai",
                    "plan",
                    "trip",
                    "assistant",
                    "help",
                    t("palette.planTrip"),
                  ]}
                  onSelect={() =>
                    run(() => openGearFinder(query.trim() || undefined))
                  }
                  className={itemClass}
                >
                  <span className="grid size-7 place-items-center rounded-md bg-(image:--gradient-brand) text-primary-foreground">
                    <Sparkles className="size-3.5" aria-hidden />
                  </span>
                  {query.trim()
                    ? t("palette.askPlanner", { query: query.trim() })
                    : t("palette.planTrip")}
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group
              heading={t("palette.groups.categories")}
              className={groupClass}
            >
              {categories.map((category) => {
                const Icon = categoryIcon(category.name)
                return (
                  <Command.Item
                    key={category.id}
                    value={`category ${category.name}`}
                    keywords={[t("palette.groups.categories")]}
                    onSelect={() => go(`/gear?category=${category.id}`)}
                    className={itemClass}
                  >
                    <Icon className="size-4 text-primary" aria-hidden />
                    <span className="flex-1">{category.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format.number(category.count)}
                    </span>
                  </Command.Item>
                )
              })}
              {QUICK_FILTERS.map((filter) => (
                <Command.Item
                  key={filter.href}
                  value={`filter ${filter.key}`}
                  keywords={[quickFilterLabel(filter)]}
                  onSelect={() => go(filter.href)}
                  className={itemClass}
                >
                  <filter.icon className="size-4 text-lagoon" aria-hidden />
                  {quickFilterLabel(filter)}
                </Command.Item>
              ))}
            </Command.Group>

            {role && (
              <Command.Group
                heading={t("palette.groups.dashboard")}
                className={groupClass}
              >
                {SIDEBAR_ITEMS[role].map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`dashboard ${item.label}`}
                    keywords={[t(`sidebar.items.${item.label}`)]}
                    onSelect={() => go(item.href)}
                    className={itemClass}
                  >
                    <item.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {t(`sidebar.items.${item.label}`)}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading={t("palette.groups.pages")}
              className={groupClass}
            >
              <Command.Item
                value="page browse all gear"
                keywords={[t("palette.browseAll")]}
                onSelect={() => go("/gear")}
                className={itemClass}
              >
                <ArrowRight
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                {t("palette.browseAll")}
              </Command.Item>
              {COMPANY_NAV.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`page ${item.key}`}
                  keywords={[t(`items.${item.key}.title`)]}
                  onSelect={() => go(item.href)}
                  className={itemClass}
                >
                  <item.icon
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  {t(`items.${item.key}.title`)}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading={t("palette.groups.actions")}
              className={groupClass}
            >
              <Command.Item
                value="action toggle theme dark light mode"
                keywords={[
                  t("palette.switchToDark"),
                  t("palette.switchToLight"),
                ]}
                onSelect={() =>
                  run(() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  )
                }
                className={itemClass}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Moon className="size-4 text-muted-foreground" aria-hidden />
                )}
                {resolvedTheme === "dark"
                  ? t("palette.switchToLight")
                  : t("palette.switchToDark")}
              </Command.Item>
              {role ? (
                <Command.Item
                  value="action log out sign out"
                  keywords={[t("palette.logOut")]}
                  onSelect={() => run(() => startTransition(() => logout()))}
                  className={itemClass}
                >
                  <LogOut
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  {t("palette.logOut")}
                </Command.Item>
              ) : (
                <>
                  <Command.Item
                    value="action log in sign in"
                    keywords={[t("palette.logIn")]}
                    onSelect={() => go("/login")}
                    className={itemClass}
                  >
                    <LogIn
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {t("palette.logIn")}
                  </Command.Item>
                  <Command.Item
                    value="action sign up register create account"
                    keywords={[t("palette.createAccount")]}
                    onSelect={() => go("/register")}
                    className={itemClass}
                  >
                    <UserPlus
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {t("palette.createAccount")}
                  </Command.Item>
                </>
              )}
            </Command.Group>
          </Command.List>

          <div className="flex items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border bg-muted px-1 font-mono">↑</kbd>
              <kbd className="rounded border bg-muted px-1 font-mono">↓</kbd>
              {t("palette.toMove")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="inline-flex items-center rounded border bg-muted px-1 font-mono">
                <CornerDownLeft className="size-3" aria-hidden />
              </kbd>
              {t("palette.toOpen")}
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

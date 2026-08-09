import Link from "next/link"
import { Menu, Mountain } from "lucide-react"

import { AccountMenu } from "@/components/shared/AccountMenu"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DASHBOARD_HOME } from "@/lib/routes"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Browse gear", href: "/gear" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export async function Navbar() {
  const session = await getSession()
  const dashboardHref = session ? DASHBOARD_HOME[session.role] : null

  const mobileLinks = session
    ? NAV_LINKS
    : [
        ...NAV_LINKS,
        { label: "Log in", href: "/login" },
        { label: "Sign up", href: "/register" },
      ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold"
        >
          <Mountain className="size-5 text-primary" aria-hidden />
          GearUp
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {session && dashboardHref ? (
            <AccountMenu
              user={session}
              links={[
                { label: "Dashboard", href: dashboardHref, icon: "dashboard" },
              ]}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "hidden sm:inline-flex"
                )}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "hidden sm:inline-flex"
                )}
              >
                Sign up
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4 text-sm">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-2 py-2 hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"
import { Mountain } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-heading font-bold">
            <Mountain className="size-4 text-primary" aria-hidden />
            GearUp
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rent sports &amp; outdoor gear instantly.
          </p>
        </div>

        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/gear" className="hover:text-foreground">
            Browse gear
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Become a provider
          </Link>
        </nav>
      </div>
    </footer>
  )
}

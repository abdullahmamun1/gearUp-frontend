import { PageTransition } from "@/components/shared/motion/PageTransition"
import { getCategories } from "@/api/categories"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { SearchButton } from "@/components/layout/SearchButton"
import { SessionProvider } from "@/providers/SessionProvider"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireSession } from "@/lib/session"

import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { VerifyEmailBanner } from "@/components/modules/dashboard/VerifyEmailBanner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const categoriesRes = await getCategories()
  const categories = (categoriesRes.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    count: category._count?.gearItems ?? 0,
  }))

  return (
    <SessionProvider value={session}>
      <SidebarProvider>
        <DashboardSidebar />

        {/* min-w-0 lets wide tables scroll inside their own container
            instead of stretching the whole page. */}
        <SidebarInset className="min-w-0">
          <header
            data-dashboard-shell
            className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm"
          >
            <SidebarTrigger className="-ml-1" />

            <div className="ml-auto flex items-center gap-2">
              <SearchButton className="hidden md:flex" />
              <SearchButton compact className="md:hidden" />
              <ThemeToggle />
            </div>
          </header>

          <CommandPalette categories={categories} role={session.role} />
          <main className="flex-1 p-4 sm:p-6">
            <VerifyEmailBanner />
            <PageTransition>{children}</PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}

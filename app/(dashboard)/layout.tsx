import { SessionProvider } from "@/components/providers/SessionProvider"
import { AccountMenu } from "@/components/shared/AccountMenu"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireSession } from "@/lib/session"

import { DashboardSidebar } from "./_components/DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  return (
    <SessionProvider value={session}>
      <SidebarProvider>
        <DashboardSidebar />

        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <AccountMenu
                user={session}
                links={[{ label: "Back to site", href: "/", icon: "home" }]}
              />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}

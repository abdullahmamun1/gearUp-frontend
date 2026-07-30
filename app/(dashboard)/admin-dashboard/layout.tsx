import { requireSession } from "@/lib/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession("ADMIN")
  return children
}

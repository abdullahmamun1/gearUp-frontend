import { requireSession } from "@/lib/session"

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession("CUSTOMER")
  return children
}

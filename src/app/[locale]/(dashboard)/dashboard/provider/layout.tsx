import { requireSession } from "@/lib/session"

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession("PROVIDER")
  return children
}

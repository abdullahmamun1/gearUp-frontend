import { redirect } from "next/navigation"

export default async function PaymentCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) redirect("/dashboard/customer/orders")

  redirect(`/dashboard/customer/orders/${orderId}?cancelled=1`)
}

import { redirect } from "next/navigation"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) redirect("/customer-dashboard/orders")

  redirect(`/customer-dashboard/orders/${orderId}?paid=1`)
}

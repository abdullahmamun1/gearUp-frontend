import { getTranslations } from "@/i18n/getTranslations"

import { getSubscribers } from "@/api/admin"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminSubscribersFilters } from "@/utils/filters/admin"

import { SubscribersList } from "./SubscribersList"

export async function SubscribersTable({
  filters,
}: {
  filters: AdminSubscribersFilters
}) {
  const res = await getSubscribers(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.subscribers")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <SubscribersList filters={filters} initialData={res.data} />
}

import { getTranslations } from "@/i18n/getTranslations"

import { getInbox } from "@/api/inbox"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminInboxFilters } from "@/utils/filters/admin"

import { InboxView } from "./InboxView"

export async function InboxTable({
  filters,
  selectedId,
}: {
  filters: AdminInboxFilters
  selectedId?: string
}) {
  const res = await getInbox(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.inbox")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return (
    <InboxView
      filters={filters}
      initialData={res.data}
      selectedId={selectedId}
    />
  )
}

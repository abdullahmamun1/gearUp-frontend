"use client"

import { Link } from "@/i18n/navigation"
import { Inbox, MailOpen } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { useInbox } from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import type { ContactMessage, InboxList } from "@/types"
import { ADMIN_INBOX_PATH, type AdminInboxFilters } from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

import { MessagePanel } from "./MessagePanel"

export function InboxView({
  filters,
  initialData,
  selectedId,
}: {
  filters: AdminInboxFilters
  initialData: InboxList
  selectedId?: string
}) {
  const { data, error, isFetching } = useInbox(filters, initialData)
  const t = useTranslations("admin.inbox")

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const messages = data?.data ?? []
  const meta = data?.meta
  const hrefFor = (id?: string, page = filters.page) =>
    buildHref(ADMIN_INBOX_PATH, { ...filters, page, id })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
      <section
        aria-label={t("messagesLabel")}
        className={cn("min-w-0", selectedId && "hidden lg:block")}
      >
        {messages.length === 0 ? (
          <EmptyState>
            {filters.searchTerm || filters.status ? t("noMatch") : t("empty")}
          </EmptyState>
        ) : (
          <>
            <ul
              className={cn(
                "divide-y overflow-hidden rounded-2xl border bg-card shadow-xs transition-opacity",
                isFetching && "opacity-70"
              )}
            >
              {messages.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  href={hrefFor(message.id)}
                  selected={message.id === selectedId}
                />
              ))}
            </ul>
            <Pagination
              page={filters.page}
              totalPages={meta?.totalPages ?? 1}
              hrefFor={(page) => hrefFor(undefined, page)}
              label={t("pagination")}
            />
          </>
        )}
      </section>

      <section
        aria-label={t("messageLabel")}
        className={cn("min-w-0", !selectedId && "hidden lg:block")}
      >
        {selectedId ? (
          <MessagePanel
            key={selectedId}
            id={selectedId}
            backHref={hrefFor(undefined)}
          />
        ) : (
          <div className="grid h-full min-h-80 place-items-center gap-2 rounded-2xl border border-dashed bg-card p-10 text-center">
            <Inbox className="size-9 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("pick")}</p>
          </div>
        )}
      </section>
    </div>
  )
}

function MessageRow({
  message,
  href,
  selected,
}: {
  message: ContactMessage
  href: string
  selected: boolean
}) {
  const unread = !message.readAt
  const t = useTranslations("admin.inbox")
  const format = useFormat()

  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "grid gap-1 px-4 py-3.5 transition-colors hover:bg-accent/60",
          selected && "bg-primary/8 hover:bg-primary/10"
        )}
      >
        <span className="flex items-center gap-2">
          {unread ? (
            <span
              className="size-2 shrink-0 rounded-full bg-ember"
              aria-label={t("unread")}
            />
          ) : (
            <MailOpen
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              unread ? "font-semibold" : "font-medium"
            )}
          >
            {message.name}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {format.date(message.createdAt)}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm">
            {message.subject || t("noSubject")}
          </span>
          {message.status === "REPLIED" && (
            <Badge variant="success">{t("statusReplied")}</Badge>
          )}
          {message.status === "ARCHIVED" && (
            <Badge variant="secondary">{t("statusArchived")}</Badge>
          )}
        </span>
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {message.message}
        </span>
      </Link>
    </li>
  )
}

"use server"

import { apiFetch } from "@/lib/apiClient"
import type { ContactMessage, InboxList } from "@/types"
import { toAdminQuery, type AdminInboxFilters } from "@/utils/filters/admin"

/** `GET /api/admin/inbox` — contact form messages (archived only on request). */
export async function getInbox(filters: AdminInboxFilters) {
  return apiFetch<InboxList>(`/api/admin/inbox?${toAdminQuery({ ...filters })}`)
}

/** Opening a message marks it read. */
export async function getInboxMessage(messageId: string) {
  return apiFetch<ContactMessage>(`/api/admin/inbox/${messageId}`)
}

export async function setMessageArchived(messageId: string, archived: boolean) {
  return apiFetch<ContactMessage>(`/api/admin/inbox/${messageId}`, {
    method: "PATCH",
    body: { archived },
  })
}

/** An AI-suggested reply to edit. Nothing is sent. */
export async function draftInboxReply(messageId: string) {
  return apiFetch<{ reply: string }>(`/api/admin/inbox/${messageId}/draft`, {
    method: "POST",
  })
}

/** Emails the reply to the sender and marks the message replied. */
export async function replyToMessage(messageId: string, body: string) {
  return apiFetch<ContactMessage>(`/api/admin/inbox/${messageId}/reply`, {
    method: "POST",
    body: { body },
  })
}

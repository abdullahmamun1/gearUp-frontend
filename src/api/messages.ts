"use server"

import { apiFetch } from "@/lib/apiClient"
import type { OrderMessage, UnreadMessages } from "@/types"

export async function getOrderMessages(orderId: string) {
  return apiFetch<OrderMessage[]>(`/api/rentals/${orderId}/messages`)
}

export async function sendOrderMessage(orderId: string, body: string) {
  return apiFetch<OrderMessage>(`/api/rentals/${orderId}/messages`, {
    method: "POST",
    body: { body },
  })
}

export async function markOrderMessagesRead(orderId: string) {
  return apiFetch<{ marked: number }>(`/api/rentals/${orderId}/messages/read`, {
    method: "PATCH",
  })
}

export async function getUnreadMessages() {
  return apiFetch<UnreadMessages>("/api/messages/unread")
}

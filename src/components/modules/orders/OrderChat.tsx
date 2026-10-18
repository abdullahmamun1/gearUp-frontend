"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowUp,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
} from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { markOrderMessagesRead, sendOrderMessage } from "@/api/messages"
import { Button } from "@/components/ui/button"
import { messageKeys, useOrderMessages } from "@/hooks/queries/messages"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import type { OrderMessage } from "@/types"

const TIME_ZONE = "Asia/Dhaka"
const intlTag = (locale: string) => (locale === "bn" ? "bn-BD" : "en-GB")
const dayLabel = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(intlTag(locale), {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
const timeLabel = (iso: string, locale: string) =>
  new Date(iso).toLocaleTimeString(intlTag(locale), {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  })

/**
 * The order's conversation between customer and provider. Polls while open
 * (no WebSockets on Vercel), marks incoming messages read, and shows your
 * own messages instantly while they send.
 */
export function OrderChat({
  orderId,
  otherName,
}: {
  orderId: string
  /** Who's on the other side, for the empty state and header. */
  otherName: string
}) {
  const t = useTranslations("dashboard.chat")
  const locale = useLocale()
  const { user } = useSessionUser()
  const queryClient = useQueryClient()
  const thread = useOrderMessages(orderId)
  const [draft, setDraft] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const messages = thread.data ?? []

  // Anything from the other side that's unread gets marked once seen.
  const unreadFromThem = messages.some(
    (message) => message.senderId !== user?.id && !message.readAt
  )
  useEffect(() => {
    if (!unreadFromThem || !user) return
    markOrderMessagesRead(orderId).then(() =>
      queryClient.invalidateQueries({ queryKey: messageKeys.unread })
    )
  }, [unreadFromThem, orderId, queryClient, user])

  // Stick to the bottom as messages arrive.
  const lastId = messages.at(-1)?.id
  useEffect(() => {
    const node = listRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [lastId])

  const send = useMutation({
    mutationFn: async (body: string) => {
      const res = await sendOrderMessage(orderId, body)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onMutate: async (body) => {
      const key = messageKeys.thread(orderId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<OrderMessage[]>(key)
      const optimistic: OrderMessage = {
        id: `pending-${Date.now()}`,
        rentalOrderId: orderId,
        senderId: user?.id ?? "",
        body,
        readAt: null,
        createdAt: new Date().toISOString(),
        sender: {
          id: user?.id ?? "",
          name: user?.name ?? t("you"),
          role: user?.role ?? "CUSTOMER",
          avatarUrl: null,
        },
      }
      queryClient.setQueryData<OrderMessage[]>(key, [
        ...(previous ?? []),
        optimistic,
      ])
      setDraft("")
      return { previous, body }
    },
    onError: (error, _body, context) => {
      queryClient.setQueryData(messageKeys.thread(orderId), context?.previous)
      if (context) setDraft(context.body)
      toast.error(error.message || t("sendFailed"))
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: messageKeys.thread(orderId) }),
  })

  function submit() {
    const body = draft.trim()
    if (!body || send.isPending) return
    send.mutate(body.slice(0, 2000))
  }

  return (
    <section className="mt-6 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <MessageCircle className="size-5 text-primary" aria-hidden />
        <h2 className="font-heading text-lg font-semibold">{t("title")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {t("with", { name: otherName })}
        </span>
      </div>

      <div
        ref={listRef}
        className="max-h-[28rem] min-h-48 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {thread.isPending ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("loading")}
          </p>
        ) : thread.isError ? (
          <p className="py-10 text-center text-sm text-destructive">
            {thread.error.message}
          </p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-pretty text-muted-foreground">
            {t("empty", { name: otherName })}
          </p>
        ) : (
          <ol className="grid gap-2">
            {messages.map((message, index) => {
              const mine = message.senderId === user?.id
              const newDay =
                index === 0 ||
                dayLabel(message.createdAt, locale) !==
                  dayLabel(messages[index - 1]!.createdAt, locale)
              const pending = message.id.startsWith("pending-")
              return (
                <li key={message.id} className="grid gap-2">
                  {newDay && (
                    <span className="my-2 justify-self-center rounded-full bg-muted px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {dayLabel(message.createdAt, locale)}
                    </span>
                  )}
                  <div
                    className={cn(
                      "flex items-end gap-2",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    {!mine && <Avatar message={message} />}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                        mine
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-muted",
                        pending && "opacity-70"
                      )}
                    >
                      <p className="[overflow-wrap:anywhere] whitespace-pre-line">
                        {message.body}
                      </p>
                      <p
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[10px]",
                          mine ? "opacity-80" : "text-muted-foreground"
                        )}
                      >
                        {timeLabel(message.createdAt, locale)}
                        {mine &&
                          (pending ? (
                            <Loader2
                              className="size-3 animate-spin"
                              aria-label={t("sending")}
                            />
                          ) : message.readAt ? (
                            <CheckCheck
                              className="size-3.5"
                              aria-label={t("read")}
                            />
                          ) : (
                            <Check
                              className="size-3.5"
                              aria-label={t("sent")}
                            />
                          ))}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="border-t p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <label htmlFor={`chat-${orderId}`} className="sr-only">
            {t("label", { name: otherName })}
          </label>
          <textarea
            id={`chat-${orderId}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={t("placeholder", { name: otherName })}
            className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-lg"
            disabled={!draft.trim() || send.isPending}
            aria-label={t("send")}
          >
            <ArrowUp aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  )
}

function Avatar({ message }: { message: OrderMessage }) {
  const initials = message.sender.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {message.sender.avatarUrl ? (
        <Image
          src={message.sender.avatarUrl}
          alt=""
          fill
          sizes="28px"
          className="object-cover"
        />
      ) : (
        initials
      )}
    </span>
  )
}

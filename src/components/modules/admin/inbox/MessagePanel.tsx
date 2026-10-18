"use client"

import { Link } from "@/i18n/navigation"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import {
  draftInboxReply,
  replyToMessage,
  setMessageArchived,
} from "@/api/inbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  attentionKeys,
  inboxKeys,
  useInboxMessage,
} from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import type { ContactMessage } from "@/types"

export function MessagePanel({
  id,
  backHref,
}: {
  id: string
  backHref: string
}) {
  const queryClient = useQueryClient()
  const { data: message, error, isPending } = useInboxMessage(id)
  const t = useTranslations("admin.inbox")
  const format = useFormat()

  // Opening it marked it read: refresh the list dots and the sidebar badge.
  const loaded = Boolean(message)
  useEffect(() => {
    if (!loaded) return
    queryClient.invalidateQueries({ queryKey: inboxKeys.all })
    queryClient.invalidateQueries({ queryKey: attentionKeys.all })
  }, [loaded, queryClient])

  if (isPending) {
    return (
      <div className="grid gap-4 rounded-2xl border bg-card p-6 shadow-xs">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (error || !message) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-destructive shadow-xs">
        {error?.message || t("openFailed")}
      </div>
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <header className="flex flex-wrap items-start gap-3 border-b p-5">
        <Link
          href={backHref}
          scroll={false}
          className="grid size-8 place-items-center rounded-md hover:bg-accent lg:hidden"
          aria-label={t("back")}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-pretty">
            {message.subject || t("noSubject")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{message.name}</span>{" "}
            &lt;
            <a
              href={`mailto:${message.email}`}
              className="underline-offset-4 hover:underline"
            >
              {message.email}
            </a>
            &gt; · {format.dateTime(message.createdAt)}
          </p>
        </div>
        <StatusBadge status={message.status} />
        <ArchiveButton message={message} />
      </header>

      <div className="p-5">
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {message.message}
        </p>
      </div>

      {message.replyBody && (
        <div className="mx-5 mb-5 rounded-lg border-l-4 border-success/60 bg-success/8 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("yourReply")}
            {message.repliedAt && ` · ${format.dateTime(message.repliedAt)}`}
          </p>
          <p className="mt-1 text-sm whitespace-pre-line">
            {message.replyBody}
          </p>
        </div>
      )}

      <ReplyComposer message={message} />
    </article>
  )
}

function StatusBadge({ status }: { status: ContactMessage["status"] }) {
  const t = useTranslations("admin.inbox")
  if (status === "REPLIED")
    return <Badge variant="success">{t("statusReplied")}</Badge>
  if (status === "ARCHIVED")
    return <Badge variant="secondary">{t("statusArchived")}</Badge>
  return <Badge variant="warning">{t("statusNew")}</Badge>
}

function useRefreshInbox(id: string) {
  const queryClient = useQueryClient()
  return (message: ContactMessage) => {
    queryClient.setQueryData(inboxKeys.message(id), message)
    queryClient.invalidateQueries({ queryKey: inboxKeys.all })
    queryClient.invalidateQueries({ queryKey: attentionKeys.all })
  }
}

function ArchiveButton({ message }: { message: ContactMessage }) {
  const archived = message.status === "ARCHIVED"
  const refreshInbox = useRefreshInbox(message.id)
  const t = useTranslations("admin.inbox")
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await setMessageArchived(message.id, !archived)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: (updated) => {
      refreshInbox(updated)
      toast.success(archived ? t("unarchived") : t("archivedToast"))
    },
    onError: (error) => toast.error(error.message || t("updateFailed")),
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : archived ? (
        <ArchiveRestore aria-hidden />
      ) : (
        <Archive aria-hidden />
      )}
      {archived ? t("unarchive") : t("archive")}
    </Button>
  )
}

function ReplyComposer({ message }: { message: ContactMessage }) {
  const [body, setBody] = useState("")
  const refreshInbox = useRefreshInbox(message.id)
  const t = useTranslations("admin.inbox")
  // The greeting is part of the (English) email itself, so "there" stays.
  const firstName = message.name.split(/\s+/)[0] || "there"

  const draft = useMutation({
    mutationFn: async () => {
      const res = await draftInboxReply(message.id)
      if (!res.success) throw new Error(res.message)
      return res.data.reply
    },
    onSuccess: (reply) => setBody(reply),
    onError: (error) => toast.error(error.message || t("draftFailed")),
  })

  const send = useMutation({
    mutationFn: async () => {
      const res = await replyToMessage(message.id, body.trim())
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: (updated) => {
      refreshInbox(updated)
      setBody("")
      toast.success(t("sent", { email: message.email }))
    },
    onError: (error) => toast.error(error.message || t("sendFailed")),
  })

  const tooShort = body.trim().length < 10

  return (
    <form
      className="grid gap-3 border-t bg-muted/30 p-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (!tooShort) send.mutate()
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`reply-${message.id}`}>
          {message.replyBody ? t("sendAnother") : t("replyByEmail")}
        </Label>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={() => draft.mutate()}
          disabled={draft.isPending || send.isPending}
        >
          {draft.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Sparkles aria-hidden />
          )}
          {body ? t("redraft") : t("draft")}
        </Button>
      </div>
      <Textarea
        id={`reply-${message.id}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={8}
        maxLength={5000}
        className="min-h-40 bg-background"
        placeholder={t("placeholder", { name: firstName })}
        aria-busy={draft.isPending || undefined}
        disabled={draft.isPending}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{t("aiNote")}</p>
        <Button type="submit" disabled={tooShort || send.isPending}>
          {send.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Send aria-hidden />
          )}
          {t("sendReply")}
        </Button>
      </div>
    </form>
  )
}

"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { usePathname } from "@/i18n/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import {
  ArrowRight,
  ArrowUp,
  Backpack,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"

import { askGearFinder } from "@/api/ai"
import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { buildGearHref, DEFAULT_GEAR_FILTERS } from "@/utils/filters/gear"
import { useFormat } from "@/i18n/useFormat"
import type { ChatMessage, GearFinderResult, GearItem } from "@/types"

const OPEN_EVENT = "gearup:open-gear-finder"
const STORAGE_KEY = "gearup:gear-finder"
const MAX_TURNS = 10

/** Message keys under ai.finder.suggestions. */
const SUGGESTIONS = ["camping", "kayak", "cycling", "trekking"] as const
/** The budget in the trekking suggestion. */
const SUGGESTED_BUDGET = 1000

/** Opens the trip planner from anywhere, optionally asking `prompt` at once. */
export function openGearFinder(prompt?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: prompt }))
}

type Message = ChatMessage & {
  gear?: GearItem[]
  filters?: GearFinderResult["filters"]
  error?: boolean
}

type Saved = { messages: Message[]; from?: string; to?: string }

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

function save(value: Saved) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Private mode or full storage: the chat just won't survive a reload.
  }
}

/**
 * The AI trip planner: a floating button plus a chat panel. Replies come
 * from the backend, which only recommends real, rentable catalogue items.
 * Text is rendered as plain text, never HTML.
 */
export function GearFinder() {
  const t = useTranslations("ai.finder")
  const tActions = useTranslations("common.actions")
  const locale = useLocale()
  const format = useFormat()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [dates, setDates] = useState<{ from?: string; to?: string }>({})
  const [draft, setDraft] = useState("")
  const [isPending, startTransition] = useTransition()
  const restored = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Restore once on first open (sessionStorage isn't there during prerender).
  function restore() {
    if (restored.current) return
    restored.current = true
    const saved = load()
    if (saved) {
      setMessages(saved.messages)
      setDates({ from: saved.from, to: saved.to })
    }
  }

  function send(text: string, base = messages) {
    const content = text.trim().slice(0, 500)
    if (!content || isPending) return
    const next: Message[] = [...base, { role: "user", content }]
    setMessages(next)
    setDraft("")

    startTransition(async () => {
      const history = next
        .filter((message) => !message.error)
        .slice(-MAX_TURNS)
        .map(({ role, content }) => ({ role, content }))
      // The backend wants the conversation to start with the renter.
      while (history[0]?.role === "assistant") history.shift()

      const res = await askGearFinder({
        messages: history,
        from: dates.from,
        to: dates.to,
        locale,
      })
      const reply: Message = res.success
        ? {
            role: "assistant",
            content: res.data.reply,
            gear: res.data.gear,
            filters: res.data.filters,
          }
        : {
            role: "assistant",
            content: res.message || t("error"),
            error: true,
          }
      setMessages((current) => {
        const updated = [...current, reply]
        save({ messages: updated, ...dates })
        return updated
      })
    })
  }

  // The window listener is registered once; it calls the latest `send`.
  const sendRef = useRef(send)
  const messagesRef = useRef(messages)
  useEffect(() => {
    sendRef.current = send
    messagesRef.current = messages
  })

  useEffect(() => {
    function onOpen(event: Event) {
      // History may not be in state yet on the first open: read it directly.
      const base = restored.current
        ? messagesRef.current
        : (load()?.messages ?? [])
      restore()
      setOpen(true)
      const prompt = (event as CustomEvent<string | undefined>).detail
      if (prompt) sendRef.current(prompt, base)
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  // Keep the newest message in view.
  useEffect(() => {
    const node = listRef.current
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [messages, isPending])

  function reset() {
    setMessages([])
    setDraft("")
    save({ messages: [], ...dates })
    inputRef.current?.focus()
  }

  function changeDates(from?: string, to?: string) {
    setDates({ from, to })
    save({ messages, from, to })
  }

  // The gear page has its own sticky "Rent" bar at the bottom on phones.
  const hideFabOnPhones = /^\/gear\/[^/]+$/.test(pathname)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          restore()
          setOpen(true)
        }}
        className={cn(
          "group fixed right-4 bottom-4 z-40 flex h-12 cursor-pointer items-center gap-2 rounded-full border glass pr-5 pl-2 text-sm font-semibold shadow-lg transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:right-6 sm:bottom-6",
          hideFabOnPhones && "max-md:hidden",
          open && "hidden"
        )}
      >
        <span className="grid size-8 place-items-center rounded-full bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
          <Sparkles
            className="size-4 transition-transform group-hover:rotate-12"
            aria-hidden
          />
        </span>
        {t("fab")}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        >
          <div className="flex items-center gap-3 border-b px-5 py-4 pr-12">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <SheetTitle className="font-heading text-base font-semibold">
                {t("title")}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {t("description")}
              </SheetDescription>
            </div>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={reset}
                aria-label={t("newChatLabel")}
                title={t("newChatTitle")}
              >
                <RotateCcw aria-hidden />
              </Button>
            )}
          </div>

          <div className="border-b bg-muted/30 px-5 py-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("datesHint")}
            </p>
            <DateRangePicker
              from={dates.from}
              to={dates.to}
              onChange={changeDates}
            />
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-5 py-5"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="grid gap-4">
                <div className="rounded-2xl bg-primary/5 p-4 text-sm">
                  <p className="font-medium">{t("introTitle")}</p>
                  <p className="mt-1 text-muted-foreground">{t("introBody")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((id) => {
                    const suggestion = t(`suggestions.${id}`, {
                      amount: format.number(SUGGESTED_BUDGET),
                    })
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="cursor-pointer rounded-full border bg-card px-3.5 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                      >
                        {suggestion}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <ol className="grid gap-4">
                {messages.map((message, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex animate-in flex-col duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <p
                      className={cn(
                        "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                        message.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : message.error
                            ? "rounded-bl-md border border-destructive/30 bg-destructive/8 text-destructive"
                            : "rounded-bl-md bg-muted"
                      )}
                    >
                      {message.content}
                    </p>
                    {message.error && index === messages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const lastUser = [...messages]
                            .reverse()
                            .find((item) => item.role === "user")
                          if (lastUser) {
                            const base = messages.slice(
                              0,
                              messages.lastIndexOf(lastUser)
                            )
                            send(lastUser.content, base)
                          }
                        }}
                        className="mt-1.5 cursor-pointer text-xs font-medium text-primary hover:underline"
                      >
                        {tActions("retry")}
                      </button>
                    )}
                    {message.gear && message.gear.length > 0 && (
                      <SuggestedGear
                        gear={message.gear}
                        filters={message.filters}
                        onNavigate={() => setOpen(false)}
                      />
                    )}
                  </li>
                ))}
                {isPending && (
                  <li className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3.5">
                    <span className="sr-only">{t("thinking")}</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        aria-hidden
                        className="size-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </li>
                )}
              </ol>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              send(draft)
            }}
            className="border-t p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
              <label htmlFor="gear-finder-input" className="sr-only">
                {t("inputLabel")}
              </label>
              <textarea
                id="gear-finder-input"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    send(draft)
                  }
                }}
                rows={1}
                maxLength={500}
                placeholder={
                  messages.length
                    ? t("placeholderFollowUp")
                    : t("placeholderFirst")
                }
                className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-xl"
                disabled={!draft.trim() || isPending}
                aria-label={t("send")}
              >
                <ArrowUp aria-hidden />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {t("poweredBy")}
            </p>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SuggestedGear({
  gear,
  filters,
  onNavigate,
}: {
  gear: GearItem[]
  filters?: GearFinderResult["filters"]
  onNavigate: () => void
}) {
  const t = useTranslations("ai.finder")
  const tUnits = useTranslations("common.units")
  const format = useFormat()

  return (
    <div className="mt-2 w-full max-w-[92%] overflow-hidden rounded-2xl border bg-card shadow-xs">
      <ul className="divide-y">
        {gear.map((item) => (
          <li key={item.id}>
            <Link
              href={`/gear/${item.id}`}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Backpack
                    className="absolute inset-0 m-auto size-5 text-muted-foreground"
                    aria-hidden
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {item.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.category?.name}
                  {item.provider && ` · ${item.provider.name}`}
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold whitespace-nowrap">
                {format.price(item.pricePerDay)}
                <span className="block text-[11px] font-normal text-muted-foreground">
                  {tUnits("perDay")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={buildGearHref({ ...DEFAULT_GEAR_FILTERS, ...filters })}
        onClick={onNavigate}
        className="group flex items-center justify-center gap-1.5 border-t bg-muted/40 px-3 py-2.5 text-sm font-semibold text-primary"
      >
        {t("seeAll")}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  )
}

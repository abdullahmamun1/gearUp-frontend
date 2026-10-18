"use client"

import { useDeferredValue, useState } from "react"
import { Mail, Search, Sparkles } from "lucide-react"

import { openGearFinder } from "@/components/modules/ai/GearFinder"
import { buttonVariants } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "@/i18n/translations"
import { cn } from "@/lib/utils"

export type HelpTopic = {
  id: string
  title: string
  items: { id: string; q: string; a: string }[]
}

/** Lower-cased and accent-free, so "deposit" finds "Deposits". */
const normalize = (text: string) =>
  text.toLocaleLowerCase().normalize("NFKD").replace(/\p{M}/gu, "")

/**
 * The help centre: instant search across every question and answer, topic
 * chips that jump to a section, and accordions. Renders fully on the
 * server too (search only narrows what's shown).
 */
export function HelpCenter({ topics }: { topics: HelpTopic[] }) {
  const t = useTranslations("pages.help")
  const [query, setQuery] = useState("")
  const deferred = useDeferredValue(query)
  const words = normalize(deferred).split(/\s+/).filter(Boolean)

  const visible = topics
    .map((topic) => ({
      ...topic,
      items: topic.items.filter((item) => {
        const haystack = normalize(`${item.q} ${item.a} ${topic.title}`)
        return words.every((word) => haystack.includes(word))
      }),
    }))
    .filter((topic) => topic.items.length > 0)
  const count = visible.reduce((sum, topic) => sum + topic.items.length, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <label htmlFor="help-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-13 w-full rounded-2xl border bg-card pr-4 pl-12 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <p
          className="mt-2 text-center text-sm text-muted-foreground"
          aria-live="polite"
        >
          {words.length > 0 && t("results", { count })}
        </p>
      </div>

      <nav
        aria-label={t("searchLabel")}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-xs transition-colors hover:border-primary/40 hover:bg-accent"
          >
            {topic.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="grid content-start gap-8">
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
              {t("noResults", { query: deferred.trim() })}
            </p>
          ) : (
            visible.map((topic) => (
              <section key={topic.id} id={topic.id} className="scroll-mt-28">
                <h2 className="text-h3">{topic.title}</h2>
                <Accordion
                  // Searching opens every match; browsing starts closed.
                  key={words.join(" ")}
                  multiple
                  defaultValue={
                    words.length ? topic.items.map((item) => item.id) : []
                  }
                  className="mt-3 rounded-2xl border bg-card px-5 shadow-xs"
                >
                  {topic.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionPanel>
                        <p className="pb-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                          {item.a}
                        </p>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))
          )}
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <h2 className="font-heading text-lg font-semibold">
              {t("stuck.title")}
            </h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              {t("stuck.body")}
            </p>
            <div className="mt-5 grid gap-2">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "h-11 gap-2 text-sm"
                )}
              >
                <Mail className="size-4" aria-hidden />
                {t("stuck.contact")}
              </Link>
              <button
                type="button"
                onClick={() => openGearFinder()}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 gap-2 text-sm"
                )}
              >
                <Sparkles className="size-4 text-primary" aria-hidden />
                {t("stuck.askAi")}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

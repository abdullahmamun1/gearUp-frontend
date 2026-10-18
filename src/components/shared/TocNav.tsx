"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "@/i18n/translations"

import { cn } from "@/lib/utils"

/**
 * "On this page" links that highlight the section being read. Plain anchor
 * links, so it works before hydration; the highlight is an extra.
 */
export function TocNav({
  sections,
}: {
  sections: { id: string; label: string }[]
}) {
  const t = useTranslations("common.toc")
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null)
    // The active section is the last one whose top has passed the upper
    // third of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-96px 0px -60% 0px" }
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label={t("title")}
      className="rounded-2xl border bg-card p-4 shadow-xs"
    >
      <p className="text-eyebrow text-muted-foreground">{t("title")}</p>
      <ol className="mt-3 grid gap-0.5 text-sm">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                active === section.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="font-mono text-[11px] opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

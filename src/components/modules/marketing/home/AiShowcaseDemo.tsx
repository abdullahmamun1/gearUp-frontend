"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { Backpack, Sparkles } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { openGearFinder } from "@/components/modules/ai/GearFinder"
import { TypewriterText } from "@/components/shared/motion/TypewriterText"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFormat } from "@/i18n/useFormat"
import type { GearItem } from "@/types"

type Stage = "idle" | "typing" | "thinking" | "answered"

/**
 * A scripted preview of the trip planner, using real catalogue items. It
 * plays once when scrolled into view; with reduced motion it shows the
 * finished conversation instead.
 */
export function AiShowcaseDemo({ gear }: { gear: GearItem[] }) {
  const t = useTranslations("ai.showcase")
  const tUnits = useTranslations("common.units")
  const format = useFormat()
  const question = t("question")
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>("idle")

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Starts once in view. With reduced motion it jumps straight to the
    // answer; deciding here, not during render, keeps the first client
    // render identical to the server's.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStage((current) =>
            current === "idle" ? (reduced ? "answered" : "typing") : current
          )
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    if (stage !== "thinking") return
    const timer = setTimeout(() => setStage("answered"), 1100)
    return () => clearTimeout(timer)
  }, [stage])

  const shown = stage

  return (
    <div
      ref={ref}
      className="relative rounded-3xl border bg-card p-4 shadow-xl sm:p-5"
      aria-label={t("demoLabel")}
    >
      <div className="flex items-center gap-2.5 border-b pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <span className="text-sm font-semibold">{t("demoTitle")}</span>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {t("example")}
        </span>
      </div>

      <div className="grid min-h-80 content-start gap-3 pt-4 text-sm">
        <p className="max-w-[85%] justify-self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
          {shown === "idle" ? (
            <span className="opacity-0">{question}</span>
          ) : shown === "typing" ? (
            <TypewriterText
              text={question}
              speed={32}
              onDone={() => setStage("thinking")}
            />
          ) : (
            question
          )}
        </p>

        {shown === "thinking" && (
          <span className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                aria-hidden
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        )}

        {shown === "answered" && (
          <div className="grid animate-in gap-2 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
            <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
              {t("answer")}
            </p>
            <ul className="divide-y overflow-hidden rounded-2xl border">
              {gear.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex animate-in items-center gap-3 px-3 py-2.5 duration-500 fill-mode-backwards fade-in slide-in-from-left-2 motion-reduce:animate-none"
                  )}
                  style={{ animationDelay: `${150 + index * 120}ms` }}
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <Backpack
                        className="absolute inset-0 m-auto size-4 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {format.price(item.pricePerDay)}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      {tUnits("perDay")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function OpenTripPlannerButton() {
  const t = useTranslations("ai.showcase")

  return (
    <Button
      type="button"
      variant="cta"
      size="lg"
      onClick={() => openGearFinder()}
      className="h-11 gap-2 px-6 text-sm"
    >
      <Sparkles className="size-4" aria-hidden />
      {t("tryButton")}
    </Button>
  )
}

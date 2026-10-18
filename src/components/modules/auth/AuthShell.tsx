import type { LucideIcon } from "lucide-react"
import { CreditCard, ShieldCheck, Undo2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

const TRUST = [
  { icon: CreditCard, key: "stripe" },
  { icon: ShieldCheck, key: "verified" },
  { icon: Undo2, key: "freeCancel" },
] as const

/**
 * Login and register: a full-screen split, the brand panel (desktop only)
 * filling the left half and the form centred on the right.
 * The form's title is the page's h1, so phones, which don't see the panel,
 * still get a proper heading.
 */
export function AuthShell({
  eyebrow,
  headline,
  description,
  perks,
  scene,
  title,
  subtitle,
  footnote,
  children,
}: {
  eyebrow: string
  headline: React.ReactNode
  description: string
  perks: { icon: LucideIcon; title: string; body: string }[]
  scene: React.ReactNode
  title: string
  subtitle: React.ReactNode
  footnote?: React.ReactNode
  children: React.ReactNode
}) {
  const t = useTranslations("auth.shell.trust")
  return (
    <section className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-(image:--gradient-brand) text-primary-foreground lg:flex lg:items-center lg:justify-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-noise opacity-60"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid opacity-30 mix-blend-overlay"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 -z-10 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-20 -z-10 size-96 rounded-full bg-black/10 blur-3xl"
        />

        {/* Centred in its half, mirroring the form on the right. */}
        <div className="flex w-full max-w-xl flex-col px-10 py-14 xl:px-12">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {eyebrow}
          </p>
          <p className="mt-6 text-h1">{headline}</p>
          <p className="mt-4 max-w-md text-pretty opacity-90">{description}</p>

          <ul className="mt-10 grid gap-5">
            {perks.map((perk) => (
              <li key={perk.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/15">
                  <perk.icon className="size-[18px]" aria-hidden />
                </span>
                <div>
                  <h2 className="font-heading text-sm font-semibold">
                    {perk.title}
                  </h2>
                  <p className="mt-0.5 text-sm opacity-85">{perk.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-10">
            <div className="rounded-2xl bg-card/95 p-4 text-card-foreground shadow-xl">
              <div className="mx-auto max-w-72">{scene}</div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs opacity-90">
              {TRUST.map((item) => (
                <li key={item.key} className="inline-flex items-center gap-1.5">
                  <item.icon className="size-3.5" aria-hidden />
                  {t(item.key)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="relative isolate flex items-center justify-center px-4 py-12 sm:px-8 lg:py-14">
        <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid opacity-40"
        />

        <div className="w-full max-w-md animate-in duration-500 fill-mode-backwards fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
          <h1 className="text-h2">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          {children}
          {footnote && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {footnote}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

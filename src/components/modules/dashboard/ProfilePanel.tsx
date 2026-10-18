import Image from "next/image"
import { Link } from "@/i18n/navigation"
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react"

import { cookies } from "next/headers"
import { getTranslations } from "@/i18n/getTranslations"

import { getMe } from "@/api/auth"
import { DIGITS_COOKIE } from "@/i18n/format"
import { getDashboardFormat } from "@/i18n/getFormat"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { EmailPreferences } from "./EmailPreferences"
import { LanguageSettings } from "./LanguageSettings"
import { PageHeader } from "./PageHeader"
import { ProfileForm } from "./ProfileForm"
import { PublicProfileForm } from "./PublicProfileForm"

export async function ProfilePanel() {
  const digits =
    (await cookies()).get(DIGITS_COOKIE)?.value === "latin" ? "latin" : "native"
  const [res, t, tc, format] = await Promise.all([
    getMe(),
    getTranslations("dashboard.profile"),
    getTranslations("common"),
    getDashboardFormat(),
  ])
  const user = res.data

  if (!res.success || !user) {
    return (
      <>
        <PageHeader title={t("title")} />
        <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          {res.message}
        </p>
      </>
    )
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const verified = Boolean(user.emailVerifiedAt)

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div
          aria-hidden
          className="relative h-24 bg-(image:--gradient-brand) sm:h-28"
        >
          <div className="absolute inset-0 bg-noise opacity-50" />
          <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
        </div>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3 px-5 pb-5 sm:px-6">
          <span className="relative z-10 -mt-8 grid size-20 shrink-0 place-items-center rounded-2xl bg-card font-heading text-2xl font-bold text-primary shadow-lg ring-4 ring-card">
            <span className="relative grid size-full place-items-center overflow-hidden rounded-2xl bg-primary/10">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-h3">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{tc(`roleLong.${user.role}`)}</Badge>
            <Badge
              variant={user.status === "ACTIVE" ? "success" : "destructive"}
            >
              {tc(`userStatus.${user.status}`)}
            </Badge>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4">
          <section className="rounded-2xl border bg-card shadow-xs">
            <h2 className="border-b px-5 py-4 font-heading font-semibold">
              {t("accountDetails")}
            </h2>
            <dl className="divide-y">
              <Row icon={Mail} label={t("email")}>
                <span className="inline-flex flex-wrap items-center justify-end gap-2">
                  {user.email}
                  <Badge variant={verified ? "success" : "warning"}>
                    {verified ? t("verified") : t("notVerified")}
                  </Badge>
                </span>
              </Row>
              <Row icon={Phone} label={t("phone")}>
                {user.phone || (
                  <span className="text-muted-foreground">
                    {t("notProvided")}
                  </span>
                )}
              </Row>
              <Row icon={CalendarDays} label={t("memberSince")}>
                {format.date(user.createdAt)}
              </Row>
            </dl>
          </section>
          <ProfileForm user={user} />
          {user.role !== "ADMIN" && <PublicProfileForm user={user} />}
        </div>

        <div className="grid gap-4">
          <LanguageSettings digits={digits} />
          <EmailPreferences marketing={user.marketingEmails ?? true} />

          <section className="rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="font-heading font-semibold">{t("security")}</h2>
            <ul className="mt-3 grid gap-3 text-sm">
              <li className="flex items-start gap-3">
                <Status ok={verified} />
                <span>
                  {verified ? t("emailVerified") : t("verifyToUnlock")}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  <KeyRound className="size-3.5" aria-hidden />
                </span>
                <span>
                  {t.rich("newPassword", {
                    link: (chunks) => (
                      <Link
                        href="/forgot-password"
                        className="font-medium text-primary hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

function Status({ ok }: { ok: boolean }) {
  const Icon = ok ? BadgeCheck : ShieldAlert
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full",
        ok ? "bg-success/12 text-success" : "bg-warning/15 text-warning"
      )}
    >
      <Icon className="size-3.5" aria-hidden />
    </span>
  )
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium break-all">
        {children}
      </dd>
    </div>
  )
}

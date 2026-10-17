import Link from "next/link"
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react"

import { getMe } from "@/api/auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/format"

import { EmailPreferences } from "./EmailPreferences"
import { PageHeader } from "./PageHeader"
import { ProfileForm } from "./ProfileForm"

const ROLE_LABEL = {
  CUSTOMER: "Customer",
  PROVIDER: "Provider",
  ADMIN: "Administrator",
} as const

export async function ProfilePanel() {
  const res = await getMe()
  const user = res.data

  if (!res.success || !user) {
    return (
      <>
        <PageHeader title="Profile" />
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
      <PageHeader
        title="Profile"
        description="Your account details, straight from the server."
      />

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
            <span className="grid size-full place-items-center rounded-2xl bg-primary/10">
              {initials}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-h3">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
            <Badge
              variant={user.status === "ACTIVE" ? "success" : "destructive"}
            >
              {user.status === "ACTIVE" ? "Active" : "Suspended"}
            </Badge>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4">
          <section className="rounded-2xl border bg-card shadow-xs">
            <h2 className="border-b px-5 py-4 font-heading font-semibold">
              Account details
            </h2>
            <dl className="divide-y">
              <Row icon={Mail} label="Email">
                <span className="inline-flex flex-wrap items-center justify-end gap-2">
                  {user.email}
                  <Badge variant={verified ? "success" : "warning"}>
                    {verified ? "Verified" : "Not verified"}
                  </Badge>
                </span>
              </Row>
              <Row icon={Phone} label="Phone">
                {user.phone || (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </Row>
              <Row icon={CalendarDays} label="Member since">
                {formatDate(user.createdAt)}
              </Row>
            </dl>
          </section>
          <ProfileForm user={user} />
        </div>

        <div className="grid gap-4">
          <EmailPreferences marketing={user.marketingEmails ?? true} />

          <section className="rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="font-heading font-semibold">Security</h2>
            <ul className="mt-3 grid gap-3 text-sm">
              <li className="flex items-start gap-3">
                <Status ok={verified} />
                <span>
                  {verified
                    ? "Your email is verified."
                    : "Verify your email to pay for rentals and publish listings."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  <KeyRound className="size-3.5" aria-hidden />
                </span>
                <span>
                  Need a new password?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:underline"
                  >
                    Email yourself a reset link
                  </Link>
                  . Changing it signs you out everywhere else.
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

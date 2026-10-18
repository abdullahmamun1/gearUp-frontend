import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Link } from "@/i18n/navigation"
import { Suspense } from "react"
import { CalendarRange, PackageCheck, ShieldCheck } from "lucide-react"

import { AuthShell } from "@/components/modules/auth/AuthShell"
import { LoginForm } from "@/components/modules/auth/LoginForm"
import { CampingScene } from "@/components/shared/illustrations/scenes"
import { LoginNotices } from "@/components/modules/auth/LoginPanel"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "auth.login.meta",
  })
  return {
    title: t("title"),
    description: t("description"),
  }
}

const PERKS = [
  { icon: CalendarRange, key: "bookings" },
  { icon: PackageCheck, key: "checkout" },
  { icon: ShieldCheck, key: "verified" },
] as const

/** Static: query-string messages and redirects are read in LoginPanel. */
export default async function LoginPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("auth.login")
  return (
    <AuthShell
      eyebrow={t("eyebrow")}
      headline={t("headline")}
      description={t("description")}
      perks={PERKS.map((perk) => ({
        icon: perk.icon,
        title: t(`perks.${perk.key}.title`),
        body: t(`perks.${perk.key}.body`),
      }))}
      scene={<CampingScene />}
      title={t("title")}
      subtitle={t.rich("subtitle", {
        link: (chunks) => (
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {chunks}
          </Link>
        ),
      })}
      footnote={t.rich("footnote", {
        link: (chunks) => (
          <Link
            href="/privacy#terms"
            className="underline-offset-2 hover:underline"
          >
            {chunks}
          </Link>
        ),
      })}
    >
      <Suspense fallback={null}>
        <LoginNotices />
      </Suspense>
      <LoginForm />
    </AuthShell>
  )
}

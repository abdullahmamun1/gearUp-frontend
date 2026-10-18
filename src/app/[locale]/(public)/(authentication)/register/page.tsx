import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Link } from "@/i18n/navigation"
import { BadgeCheck, Sparkles, Wallet } from "lucide-react"

import { AuthShell } from "@/components/modules/auth/AuthShell"
import { CyclingScene } from "@/components/shared/illustrations/scenes"
import { RegisterForm } from "@/components/modules/auth/RegisterForm"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "auth.register.meta",
  })
  return {
    title: t("title"),
    description: t("description"),
  }
}

const PERKS = [
  { icon: Sparkles, key: "rent" },
  { icon: Wallet, key: "earn" },
  { icon: BadgeCheck, key: "secure" },
] as const

/** Static: ?role is read in the browser after the form mounts. */
export default async function RegisterPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("auth.register")
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
      scene={<CyclingScene />}
      title={t("title")}
      subtitle={t.rich("subtitle", {
        link: (chunks) => (
          <Link
            href="/login"
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
      <RegisterForm />
    </AuthShell>
  )
}

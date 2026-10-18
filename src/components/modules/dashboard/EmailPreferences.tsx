"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import { updateEmailPreferences } from "@/api/auth"

export function EmailPreferences({ marketing }: { marketing: boolean }) {
  const t = useTranslations("dashboard.emailPrefs")
  const [checked, setChecked] = useState(marketing)
  const [isPending, startTransition] = useTransition()

  function toggle(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      const res = await updateEmailPreferences(next)
      if (!res.success) {
        setChecked(!next)
        toast.error(res.message || t("saveFailed"))
        return
      }
      toast.success(next ? t("subscribed") : t("unsubscribed"))
    })
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-xs">
      <h2 className="font-heading font-semibold">{t("title")}</h2>
      <div className="mt-3 flex items-start justify-between gap-4">
        <label htmlFor="marketing-emails" className="text-sm">
          {t("newsLabel")}
          <span className="block text-xs text-muted-foreground">
            {t("newsHint")}
          </span>
        </label>
        <Switch
          id="marketing-emails"
          checked={checked}
          onCheckedChange={toggle}
          disabled={isPending}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t("note")}</p>
    </section>
  )
}

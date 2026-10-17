"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import { updateEmailPreferences } from "@/api/auth"

export function EmailPreferences({ marketing }: { marketing: boolean }) {
  const [checked, setChecked] = useState(marketing)
  const [isPending, startTransition] = useTransition()

  function toggle(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      const res = await updateEmailPreferences(next)
      if (!res.success) {
        setChecked(!next)
        toast.error(res.message || "Couldn't save your preference.")
        return
      }
      toast.success(
        next ? "You'll get GearUp news and offers." : "No more news emails."
      )
    })
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-xs">
      <h2 className="font-heading font-semibold">Email preferences</h2>
      <div className="mt-3 flex items-start justify-between gap-4">
        <label htmlFor="marketing-emails" className="text-sm">
          News and offers
          <span className="block text-xs text-muted-foreground">
            New gear, trip ideas and the occasional deal.
          </span>
        </label>
        <Switch
          id="marketing-emails"
          checked={checked}
          onCheckedChange={toggle}
          disabled={isPending}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Emails about your bookings, payments and account security are always
        sent.
      </p>
    </section>
  )
}

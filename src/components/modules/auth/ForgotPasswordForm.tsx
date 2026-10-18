"use client"

import { Link } from "@/i18n/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck, Mail } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validation/auth"
import { forgotPassword } from "@/api/auth"

export function ForgotPasswordForm() {
  const t = useTranslations("auth")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    const res = await forgotPassword(values.email)
    if (!res.success) {
      setError("root", {
        message: res.message || t("errors.generic"),
      })
      return
    }
    setSentTo(values.email)
  }

  if (sentTo) {
    return (
      <div className="grid gap-4 text-sm">
        <p className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <MailCheck
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            {t.rich("forgot.sent", {
              email: sentTo,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </span>
        </p>
        <p className="text-muted-foreground">
          {t.rich("forgot.nothingArrived", {
            retry: (chunks) => (
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="text-primary hover:underline"
              >
                {chunks}
              </button>
            ),
          })}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errors.root.message}
        </p>
      )}
      <TextField
        id="email"
        label={t("fields.email")}
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("forgot.sending") : t("forgot.submit")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("forgot.remembered")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("forgot.backToLogin")}
        </Link>
      </p>
    </form>
  )
}

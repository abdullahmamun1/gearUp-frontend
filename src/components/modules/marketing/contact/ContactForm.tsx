"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Mail, MessageSquare, User } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { sendContactMessage } from "@/api/contact"
import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import type { Locale } from "@/types"
import {
  contactSchema,
  emptyContactForm,
  type ContactInput,
} from "@/validation/contact"

const MAX_MESSAGE = 2000

export function ContactForm() {
  const t = useTranslations("pages.contact.form")
  const errorText = useErrorMessage()
  const locale = useLocale() as Locale
  const [sent, setSent] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: emptyContactForm,
  })

  async function onSubmit(values: ContactInput) {
    const res = await sendContactMessage(values, locale)

    if (!res.success) {
      setError("root", { message: res.message })
      toast.error(res.message)
      return
    }

    setSent(res.message)
    toast.success(res.message)
    reset(emptyContactForm)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-lg sm:p-8">
        <CheckCircle2 className="size-6 text-primary" aria-hidden />
        <h2 className="mt-3 font-heading text-lg font-semibold">{sent}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("sentBody")}</p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setSent(null)}
          className="mt-5 h-9 text-sm"
        >
          {t("sendAnother")}
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-2xl border bg-card p-6 shadow-lg sm:p-8"
      noValidate
    >
      <div>
        <h2 className="text-h3">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      {errors.root ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorText(errors.root.message)}
        </p>
      ) : null}

      <TextField
        id="contact-name"
        label={t("name")}
        icon={User}
        type="text"
        autoComplete="name"
        placeholder={t("namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <TextField
        id="contact-email"
        label={t("email")}
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <TextField
        id="contact-subject"
        label={t("subject")}
        icon={MessageSquare}
        type="text"
        placeholder={t("subjectPlaceholder")}
        error={errors.subject?.message}
        {...register("subject")}
      />

      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-sm">
          {t("message")}
        </Label>
        <Textarea
          id="contact-message"
          rows={6}
          maxLength={MAX_MESSAGE}
          placeholder={t("messagePlaceholder")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="text-sm md:text-sm"
          {...register("message")}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-xs text-destructive">
            {errorText(errors.message.message)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("messageHint")}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("sending") : t("submit")}
      </Button>
    </form>
  )
}

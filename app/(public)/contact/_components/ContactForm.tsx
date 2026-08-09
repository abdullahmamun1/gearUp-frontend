"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Mail, MessageSquare, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { sendContactMessage } from "@/app/(public)/_actions/sendContactMessage"
import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  contactSchema,
  emptyContactForm,
  type ContactInput,
} from "@/lib/schemas/contact"

const MAX_MESSAGE = 2000

export function ContactForm() {
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
    const res = await sendContactMessage(values)

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
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <CheckCircle2 className="size-6 text-primary" aria-hidden />
        <h2 className="mt-3 font-heading text-lg font-semibold">{sent}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We read everything that comes in. If it&apos;s urgent, the phone
          number on the left is the fastest way to reach us.
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setSent(null)}
          className="mt-5 h-9 text-sm"
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-xl border bg-card p-6"
      noValidate
    >
      {errors.root ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}

      <TextField
        id="contact-name"
        label="Your name"
        icon={User}
        type="text"
        autoComplete="name"
        placeholder="Abdullah Mamun"
        error={errors.name?.message}
        {...register("name")}
      />

      <TextField
        id="contact-email"
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <TextField
        id="contact-subject"
        label="Subject"
        icon={MessageSquare}
        type="text"
        placeholder="A question about renting"
        error={errors.subject?.message}
        {...register("subject")}
      />

      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-sm">
          Message
        </Label>
        <Textarea
          id="contact-message"
          rows={6}
          maxLength={MAX_MESSAGE}
          placeholder="Tell us what you need — the more detail, the better we can help."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="text-sm md:text-sm"
          {...register("message")}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-xs text-destructive">
            {errors.message.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            At least 20 characters.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}

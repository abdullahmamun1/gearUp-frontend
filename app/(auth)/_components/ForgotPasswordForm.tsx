"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck, Mail } from "lucide-react"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth"
import { forgotPassword } from "@/service/auth"

export function ForgotPasswordForm() {
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
        message: res.message || "Something went wrong. Please try again.",
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
            If an account exists for <strong>{sentTo}</strong>, a reset link is
            on its way. It works for 30 minutes.
          </span>
        </p>
        <p className="text-muted-foreground">
          Nothing arrived? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-primary hover:underline"
          >
            try another email
          </button>
          .
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
        label="Email"
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
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  )
}

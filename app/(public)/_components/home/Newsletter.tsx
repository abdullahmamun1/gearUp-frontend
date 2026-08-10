"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { subscribeNewsletter } from "@/app/(public)/_actions/subscribeNewsletter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  emptyNewsletterForm,
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/schemas/newsletter"

export function Newsletter() {
  const [subscribed, setSubscribed] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: emptyNewsletterForm,
  })

  async function onSubmit(values: NewsletterInput) {
    const res = await subscribeNewsletter(values)

    if (!res.success) {
      setError("email", { message: res.message })
      toast.error(res.message)
      return
    }

    setSubscribed(res.message)
    toast.success(res.message)
    reset(emptyNewsletterForm)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-2xl border bg-primary/5 px-6 py-12 text-center">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          New gear, straight to your inbox
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          A short note when providers list something worth knowing about. No
          more than that.
        </p>

        {subscribed ? (
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="size-4" aria-hidden />
            {subscribed}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto mt-6 max-w-md"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 text-left">
                <Label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? "newsletter-email-error" : undefined
                  }
                  className="h-11"
                  {...register("email")}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-11 px-5 text-sm"
              >
                {isSubmitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>

            {errors.email && (
              <p
                id="newsletter-email-error"
                className="mt-2 text-left text-xs text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Backpack,
  Check,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { PasswordField } from "@/components/shared/PasswordField"
import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { DEMO_ACCOUNTS, type DemoAccount } from "@/constants/demoAccounts"
import { cn } from "@/lib/utils"
import { loginSchema, type LoginInput } from "@/validation/auth"
import { loginUser } from "@/api/auth"

import { FormError } from "./FormError"
import { AuthDivider, GoogleButton } from "./GoogleButton"

const DEMO_ICONS: Record<string, LucideIcon> = {
  Customer: Backpack,
  Provider: Store,
  Admin: ShieldCheck,
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [demo, setDemo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    const res = await loginUser(values, redirectTo)

    setError("root", { message: res.message })
    toast.error(res.message)
  }

  function fillDemo(account: DemoAccount) {
    clearErrors()
    setDemo(account.email)
    setValue("email", account.email, { shouldValidate: true })
    setValue("password", account.password, { shouldValidate: true })
  }

  const email = register("email")
  const password = register("password")

  return (
    <>
      <div className="mt-7 grid gap-5">
        <GoogleButton redirectTo={redirectTo} disabled={isSubmitting} />
        <AuthDivider label="or log in with email" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 grid gap-5"
        noValidate
      >
        <FormError message={errors.root?.message} />

        <fieldset className="rounded-xl border border-dashed border-foreground/20 bg-card/50 p-3">
          <legend className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-ember-strong" aria-hidden />
            Try a demo account
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = DEMO_ICONS[account.label] ?? Backpack
              const selected = demo === account.email
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border bg-card px-2 py-2.5 text-xs font-medium transition-all outline-none hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    selected && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {account.label}
                  {selected && (
                    <Check
                      className="absolute top-1 right-1 size-3"
                      aria-hidden
                    />
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>

        <TextField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...email}
          onChange={(event) => {
            setDemo(null)
            return email.onChange(event)
          }}
        />

        <div className="grid gap-2">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...password}
            onChange={(event) => {
              setDemo(null)
              return password.onChange(event)
            }}
          />
          <Link
            href="/forgot-password"
            className="justify-self-end text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="cta"
          size="lg"
          className="group h-11 gap-2 text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Logging in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </>
          )}
        </Button>
      </form>
    </>
  )
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/demoAccounts"
import { loginSchema, type LoginInput } from "@/lib/schemas/auth"
import { loginUser } from "@/service/auth"

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
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
    setValue("email", account.email, { shouldValidate: true })
    setValue("password", account.password, { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid gap-5"
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

      <div className="grid gap-2">
        <p className="text-xs text-muted-foreground">Try a demo account</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fillDemo(account)}
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              {account.label}
            </Button>
          ))}
        </div>
      </div>

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

      <TextField
        id="password"
        label="Password"
        icon={Lock}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}

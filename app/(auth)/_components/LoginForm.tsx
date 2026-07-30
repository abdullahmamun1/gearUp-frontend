"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { loginSchema, type LoginInput } from "@/lib/schemas/auth"
import { loginUser } from "@/service/auth"

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // On success the action redirects, so nothing after this runs.
  async function onSubmit(values: LoginInput) {
    const res = await loginUser(values, redirectTo)

    setError("root", { message: res.message })
    toast.error(res.message)
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

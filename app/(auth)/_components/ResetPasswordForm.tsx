"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth"
import { resetPassword } from "@/service/auth"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: ResetPasswordInput) {
    const res = await resetPassword(token, values.password)
    if (!res.success) {
      setError("root", {
        message: res.message || "Couldn't reset your password. Try again.",
      })
      return
    }
    router.push("/login?reason=reset")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errors.root.message}{" "}
          <Link href="/forgot-password" className="font-medium underline">
            Get a new link
          </Link>
        </p>
      )}
      <TextField
        id="password"
        label="New password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        id="confirmPassword"
        label="Confirm new password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving…" : "Set new password"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You&apos;ll be signed out on your other devices.
      </p>
    </form>
  )
}

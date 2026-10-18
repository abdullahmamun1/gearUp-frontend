"use client"

import { Link } from "@/i18n/navigation"
import { useRouter } from "@/i18n/navigation"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { PasswordField } from "@/components/shared/PasswordField"
import { Button } from "@/components/ui/button"
import { resetPasswordSchema, type ResetPasswordInput } from "@/validation/auth"
import { resetPassword } from "@/api/auth"

import { PasswordStrength } from "./PasswordStrength"

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth")
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const password = useWatch({ control, name: "password" })

  async function onSubmit(values: ResetPasswordInput) {
    const res = await resetPassword(token, values.password)
    if (!res.success) {
      setError("root", {
        message: res.message || t("reset.failed"),
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
          className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive"
        >
          {errors.root.message}{" "}
          <Link href="/forgot-password" className="font-medium underline">
            {t("reset.getNewLink")}
          </Link>
        </p>
      )}
      <PasswordField
        id="password"
        label={t("fields.newPassword")}
        autoComplete="new-password"
        placeholder={t("fields.passwordPlaceholder")}
        error={errors.password?.message}
        {...register("password")}
      />
      {!errors.password && <PasswordStrength password={password ?? ""} />}
      <PasswordField
        id="confirmPassword"
        label={t("fields.confirmNewPassword")}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button
        type="submit"
        size="lg"
        className="h-11 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        )}
        {isSubmitting ? t("reset.saving") : t("reset.submit")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("reset.signedOutNote")}
      </p>
    </form>
  )
}

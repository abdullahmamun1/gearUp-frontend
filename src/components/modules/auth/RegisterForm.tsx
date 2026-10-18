"use client"

import { useEffect } from "react"

import { useRouter } from "@/i18n/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Backpack,
  Check,
  Loader2,
  Mail,
  Phone,
  Store,
  User,
} from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { PasswordField } from "@/components/shared/PasswordField"
import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import { registerSchema, type RegisterInput } from "@/validation/auth"
import type { Locale } from "@/types"
import { loginUser, registerUser } from "@/api/auth"

import { FormError } from "./FormError"
import { AuthDivider, GoogleButton } from "./GoogleButton"
import { PasswordStrength } from "./PasswordStrength"

const ROLES = [
  {
    value: "CUSTOMER",
    icon: Backpack,
  },
  {
    value: "PROVIDER",
    icon: Store,
  },
] as const

export function RegisterForm({
  defaultRole = "CUSTOMER",
}: {
  defaultRole?: "CUSTOMER" | "PROVIDER"
}) {
  const t = useTranslations("auth")
  const errorText = useErrorMessage()
  const locale = useLocale() as Locale
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: defaultRole,
      password: "",
      confirmPassword: "",
    },
  })

  // "List your gear" links send ?role=PROVIDER. Read after mount (the form
  // renders statically, outside Suspense, so typed input survives
  // hydration) and only if the visitor hasn't picked a role yet.
  const roleTouched = Boolean(dirtyFields.role)
  useEffect(() => {
    if (roleTouched) return
    if (
      new URLSearchParams(window.location.search).get("role") === "PROVIDER"
    ) {
      setValue("role", "PROVIDER")
    }
  }, [roleTouched, setValue])

  const role = useWatch({ control, name: "role" })
  const password = useWatch({ control, name: "password" })

  async function onSubmit(values: RegisterInput) {
    const res = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone ? values.phone : undefined,
      role: values.role,
      locale,
    })

    if (!res.success) {
      setError("root", { message: res.message })
      toast.error(res.message)
      return
    }

    const login = await loginUser({
      email: values.email,
      password: values.password,
    })

    if (!login.success) {
      toast.success(t("register.createdLogIn"))
      router.replace("/login")
      return
    }

    toast.success(t("register.createdDone"))
    router.replace("/")
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-7 grid gap-5"
      noValidate
    >
      <FormError message={errors.root?.message} />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">
          {t("register.roleLegend")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((option) => (
            <label
              key={option.value}
              className="group/role relative cursor-pointer rounded-2xl border bg-card p-3.5 transition-all hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-checked:shadow-glow-primary has-focus-visible:ring-2 has-focus-visible:ring-ring"
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register("role")}
              />
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-has-checked/role:bg-primary group-has-checked/role:text-primary-foreground">
                <option.icon className="size-[18px]" aria-hidden />
              </span>
              <span className="mt-3 block text-sm font-semibold">
                {t(`register.roles.${option.value}.title`)}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t(`register.roles.${option.value}.body`)}
              </span>
              <span
                aria-hidden
                className="absolute top-3 right-3 grid size-5 place-items-center rounded-full border bg-background text-transparent transition-colors group-has-checked/role:border-primary group-has-checked/role:bg-primary group-has-checked/role:text-primary-foreground"
              >
                <Check className="size-3" />
              </span>
            </label>
          ))}
        </div>
        {errors.role ? (
          <p className="text-xs text-destructive">
            {errorText(errors.role.message)}
          </p>
        ) : null}
      </fieldset>

      <GoogleButton
        label={t("google.signUp")}
        role={role}
        disabled={isSubmitting}
      />
      <AuthDivider label={t("register.divider")} />

      <TextField
        id="name"
        label={t("fields.fullName")}
        icon={User}
        type="text"
        autoComplete="name"
        placeholder={t("fields.namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

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

      <TextField
        id="phone"
        label={
          <>
            {t("fields.phone")}
            <span className="font-normal text-muted-foreground">
              {t("fields.optional")}
            </span>
          </>
        }
        icon={Phone}
        type="tel"
        autoComplete="tel"
        placeholder="+880 1XXX XXXXXX"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <PasswordField
        id="password"
        label={t("fields.password")}
        autoComplete="new-password"
        placeholder={t("fields.passwordPlaceholder")}
        error={errors.password?.message}
        {...register("password")}
      />
      {!errors.password && <PasswordStrength password={password ?? ""} />}

      <PasswordField
        id="confirmPassword"
        label={t("fields.confirmPassword")}
        autoComplete="new-password"
        placeholder={t("fields.confirmPlaceholder")}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

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
            {t("register.submitting")}
          </>
        ) : (
          <>
            {role === "PROVIDER"
              ? t("register.submitProvider")
              : t("register.submit")}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </>
        )}
      </Button>
    </form>
  )
}

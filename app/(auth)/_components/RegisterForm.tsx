"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail, Phone, User } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth"
import { loginUser, registerUser } from "@/service/auth"

import { AuthDivider, GoogleButton } from "./GoogleButton"

const ROLES = [
  {
    value: "CUSTOMER",
    title: "I want to rent",
    body: "Browse and book gear for your trips.",
  },
  {
    value: "PROVIDER",
    title: "I want to list",
    body: "Rent out gear you already own.",
  },
] as const

export function RegisterForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "CUSTOMER",
      password: "",
      confirmPassword: "",
    },
  })

  const role = useWatch({ control, name: "role" })

  async function onSubmit(values: RegisterInput) {
    const res = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone ? values.phone : undefined,
      role: values.role,
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
      toast.success("Account created. Please log in.")
      router.replace("/login")
      return
    }

    toast.success("Account created — you're all set.")
    router.replace("/")
    router.refresh()
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

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">
          How will you use GearUp?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring/30"
            >
              <input
                type="radio"
                value={role.value}
                className="sr-only"
                {...register("role")}
              />
              <span className="block text-sm font-medium">{role.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {role.body}
              </span>
            </label>
          ))}
        </div>
        {errors.role ? (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        ) : null}
      </fieldset>

      <GoogleButton
        label="Sign up with Google"
        role={role}
        disabled={isSubmitting}
      />
      <AuthDivider />

      <TextField
        id="name"
        label="Full name"
        icon={User}
        type="text"
        autoComplete="name"
        placeholder="Abdullah Mamun"
        error={errors.name?.message}
        {...register("name")}
      />

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
        id="phone"
        label={
          <>
            Phone
            <span className="font-normal text-muted-foreground">
              (optional)
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

      <TextField
        id="password"
        label="Password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />

      <TextField
        id="confirmPassword"
        label="Confirm password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        size="lg"
        className="h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}

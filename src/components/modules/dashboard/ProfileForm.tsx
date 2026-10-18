"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Phone, User } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import { profileSchema, type ProfileInput } from "@/validation/profile"
import type { User as UserType } from "@/types"

import { updateProfile } from "@/api/auth"

export function ProfileForm({ user }: { user: UserType }) {
  const t = useTranslations("dashboard.profileForm")
  const tc = useTranslations("common.actions")
  const errorText = useErrorMessage()
  const [isEditing, setIsEditing] = useState(false)

  const defaults: ProfileInput = { name: user.name, phone: user.phone ?? "" }

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  })

  async function onSubmit(values: ProfileInput) {
    const res = await updateProfile(values)

    if (!res.success) {
      setError("root", { message: res.message })
      toast.error(errorText(res.message))
      return
    }

    toast.success(t("updated"))
    setIsEditing(false)
    reset({ name: res.data?.name ?? values.name, phone: res.data?.phone ?? "" })
  }

  function cancel() {
    reset(defaults)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsEditing(true)}
        className="w-fit gap-2"
      >
        <Pencil className="size-3.5" aria-hidden />
        {t("edit")}
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-2xl border bg-card p-5 shadow-xs"
      noValidate
    >
      <div>
        <h2 className="font-heading text-sm font-semibold">{t("title")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("description")}</p>
      </div>

      {errors.root ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorText(errors.root.message)}
        </p>
      ) : null}

      <TextField
        id="profile-name"
        label={t("name")}
        icon={User}
        type="text"
        autoComplete="name"
        placeholder={t("namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <TextField
        id="profile-phone"
        label={
          <>
            {t("phone")}
            <span className="font-normal text-muted-foreground">
              {t("optional")}
            </span>
          </>
        }
        icon={Phone}
        type="tel"
        autoComplete="tel"
        placeholder="+880 1XXX XXXXXX"
        hint={t("phoneHint")}
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc("saving") : t("saveChanges")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={cancel}
          disabled={isSubmitting}
        >
          {tc("cancel")}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Phone, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/shared/TextField"
import { Button } from "@/components/ui/button"
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile"
import type { User as UserType } from "@/types"

import { updateProfile } from "../_actions/updateProfile"

export function ProfileForm({ user }: { user: UserType }) {
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
      toast.error(res.message)
      return
    }

    toast.success("Profile updated.")
    setIsEditing(false)
    reset({ name: res.data?.name ?? values.name, phone: res.data?.phone ?? "" })
  }

  function cancel() {
    reset(defaults)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit profile
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid max-w-lg gap-5 rounded-xl border bg-card p-4 sm:p-5"
      noValidate
    >
      <div>
        <h2 className="font-heading text-sm font-semibold">Edit profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your email and role are fixed — contact support if either needs to
          change.
        </p>
      </div>

      {errors.root ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}

      <TextField
        id="profile-name"
        label="Full name"
        icon={User}
        type="text"
        autoComplete="name"
        placeholder="Abdullah Mamun"
        error={errors.name?.message}
        {...register("name")}
      />

      <TextField
        id="profile-phone"
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
        hint="Leave empty to remove your number."
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={cancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

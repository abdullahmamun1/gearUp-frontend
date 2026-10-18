"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { Camera, Crosshair, Loader2, MapPin, Trash2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { updatePublicProfile } from "@/api/auth"
import { getUploadSignature } from "@/api/uploads"
import { LocationPicker, MapFrame } from "@/components/shared/map/maps"
import { SelectField } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BD_CITIES, cityCenter } from "@/constants/cities"
import { useFormat } from "@/i18n/useFormat"
import {
  imageFileProblem,
  UPLOAD_ERROR,
  uploadToCloudinary,
} from "@/utils/cloudinary"
import type { LatLng, User } from "@/types"

const NO_CITY = "__none__"

/** Avatar for everyone; bio, city, area and pickup pin for providers. */
export function PublicProfileForm({ user }: { user: User }) {
  const t = useTranslations("dashboard.publicProfile")
  const tc = useTranslations("common")
  const format = useFormat()
  const isProvider = user.role === "PROVIDER"
  const fileInput = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState(user.avatarUrl ?? "")
  const [uploading, setUploading] = useState<number | null>(null)
  const [bio, setBio] = useState(user.bio ?? "")
  const [city, setCity] = useState(user.city ?? "")
  const [area, setArea] = useState(user.area ?? "")
  const [pin, setPin] = useState<LatLng | null>(
    user.latitude != null && user.longitude != null
      ? { latitude: user.latitude, longitude: user.longitude }
      : null
  )
  const [isPending, startTransition] = useTransition()

  async function uploadAvatar(file: File) {
    const problem = imageFileProblem(file)
    if (problem) {
      return toast.error(tc(`upload.${problem.key}`, { name: problem.name }))
    }
    const signature = await getUploadSignature("avatar")
    if (!signature.success) return toast.error(signature.message)
    setUploading(0)
    try {
      const url = await uploadToCloudinary(file, signature.data, setUploading)
      const res = await updatePublicProfile({ avatarUrl: url })
      if (!res.success) throw new Error(res.message)
      setAvatar(url)
      toast.success(t("photoUpdated"))
    } catch (error) {
      const message = (error as Error).message
      toast.error(
        message === UPLOAD_ERROR.failed
          ? tc("upload.failed")
          : message === UPLOAD_ERROR.network
            ? tc("upload.network")
            : message || t("uploadFailed")
      )
    } finally {
      setUploading(null)
    }
  }

  function removeAvatar() {
    startTransition(async () => {
      const res = await updatePublicProfile({ avatarUrl: "" })
      if (!res.success) return void toast.error(res.message)
      setAvatar("")
      toast.success(t("photoRemoved"))
    })
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error(t("noGeolocation"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setPin({
          latitude: Math.round(position.coords.latitude * 1e6) / 1e6,
          longitude: Math.round(position.coords.longitude * 1e6) / 1e6,
        }),
      () => toast.error(t("locationFailed"))
    )
  }

  function saveDetails() {
    startTransition(async () => {
      const res = await updatePublicProfile({
        bio: bio.trim(),
        city,
        area: area.trim(),
        latitude: pin?.latitude ?? null,
        longitude: pin?.longitude ?? null,
      })
      if (!res.success) return void toast.error(res.message)
      toast.success(t("saved"))
    })
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <section className="rounded-2xl border bg-card shadow-xs">
      <div className="border-b px-5 py-4">
        <h2 className="font-heading text-lg font-semibold">
          {isProvider ? t("titleProvider") : t("titleCustomer")}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {isProvider ? t("descriptionProvider") : t("descriptionCustomer")}
        </p>
      </div>

      <div className="grid gap-5 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10 font-heading text-2xl font-bold text-primary">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              initials
            )}
            {uploading !== null && (
              <span className="absolute inset-0 grid place-items-center bg-background/70 text-xs font-semibold">
                {t("uploadProgress", {
                  percent: format.number(Math.round(uploading * 100)),
                })}
              </span>
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={uploading !== null}
              className="gap-2"
            >
              {uploading !== null ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Camera aria-hidden />
              )}
              {avatar ? t("changePhoto") : t("uploadPhoto")}
            </Button>
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                onClick={removeAvatar}
                disabled={isPending}
                className="gap-2 text-muted-foreground"
              >
                <Trash2 aria-hidden />
                {t("remove")}
              </Button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) uploadAvatar(file)
              event.target.value = ""
            }}
          />
        </div>

        {isProvider && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="profile-bio">{t("about")}</Label>
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t("bioPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("bioCount", {
                  count: format.number(bio.length),
                  max: format.number(500),
                })}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-city">{t("city")}</Label>
                <SelectField
                  id="profile-city"
                  options={[
                    { value: NO_CITY, label: t("notSet") },
                    ...BD_CITIES.map((item) => ({
                      value: item.name,
                      label: tc(`city.${item.key}`),
                    })),
                  ]}
                  value={city || NO_CITY}
                  onValueChange={(value) => {
                    const next = value === NO_CITY ? "" : value
                    setCity(next)
                    // Start the pin somewhere sensible for the new city.
                    const center = cityCenter(next)
                    if (center && !pin) setPin(center)
                  }}
                  className="h-9 w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-area">{t("area")}</Label>
                <Input
                  id="profile-area"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  maxLength={60}
                  placeholder={t("areaPlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <Label>{t("pickupPoint")}</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("pickupHint")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={useMyLocation}
                    className="gap-1.5"
                  >
                    <Crosshair aria-hidden />
                    {t("useMyLocation")}
                  </Button>
                  {pin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPin(null)}
                    >
                      {t("clear")}
                    </Button>
                  )}
                </div>
              </div>
              <MapFrame className="h-64">
                <LocationPicker value={pin} onChange={setPin} />
              </MapFrame>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {pin
                  ? `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`
                  : t("noPin")}
              </p>
            </div>

            <div>
              <Button
                type="button"
                onClick={saveDetails}
                disabled={isPending}
                className="gap-2"
              >
                {isPending && <Loader2 className="animate-spin" aria-hidden />}
                {t("save")}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

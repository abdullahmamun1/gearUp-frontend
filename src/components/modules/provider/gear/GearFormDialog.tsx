"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Pencil, Plus } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { createGear } from "@/api/gear"
import { updateGear } from "@/api/gear"
import { ImageGalleryEditor } from "@/components/shared/ImageGalleryEditor"
import { SelectField } from "@/components/shared/SelectField"
import { TextField } from "@/components/shared/TextField"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { providerGearKeys } from "@/hooks/queries/providerGear"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import { useFormat } from "@/i18n/useFormat"
import {
  emptyGearForm,
  gearFormSchema,
  MAX_GALLERY_IMAGES,
  toGearFormValues,
  toGearPayload,
  toGearUpdatePayload,
  type GearFormInput,
} from "@/validation/gear"
import type { Category, GearItem, ListingDraft } from "@/types"

import { ListingWriter } from "./ListingWriter"

export function GearFormDialog({
  categories,
  gear,
}: {
  categories: Category[]
  gear?: GearItem
}) {
  const [open, setOpen] = useState(false)
  const t = useTranslations("provider.form")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          gear ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("editAria", { name: gear.name })}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button size="lg" className="h-9 text-sm">
              <Plus className="size-4" aria-hidden />
              {t("addGear")}
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{gear ? t("editTitle") : t("addGear")}</DialogTitle>
          <DialogDescription>
            {gear ? t("editDescription") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <GearForm
            categories={categories}
            gear={gear}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function GearForm({
  categories,
  gear,
  onDone,
}: {
  categories: Category[]
  gear?: GearItem
  onDone: () => void
}) {
  const t = useTranslations("provider.form")
  const tc = useTranslations("common.actions")
  const format = useFormat()
  const errorText = useErrorMessage()
  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GearFormInput>({
    resolver: zodResolver(gearFormSchema),
    defaultValues: gear ? toGearFormValues(gear) : emptyGearForm,
  })

  const { replace } = useFieldArray({ control, name: "images" })
  // The editor works with one ordered list; the form keeps cover + gallery.
  const cover = useWatch({ control, name: "imageUrl" })
  const gallery = useWatch({ control, name: "images" })
  const photos = [cover, ...(gallery ?? []).map((image) => image.url)].filter(
    (url): url is string => Boolean(url && url.trim())
  )
  function setPhotos(urls: string[]) {
    setValue("imageUrl", urls[0] ?? "", { shouldDirty: true })
    replace(urls.slice(1).map((url) => ({ url })))
  }
  const queryClient = useQueryClient()
  // Fields the AI just filled glow for a moment, so the change is noticed.
  const [aiFilled, setAiFilled] = useState<string[]>([])
  const [priceNote, setPriceNote] = useState<string | null>(null)
  const flash = (field: string) =>
    aiFilled.includes(field) &&
    "ring-2 ring-primary/40 bg-primary/5 transition-shadow duration-700"

  function applyDraft(draft: ListingDraft) {
    const highlights = draft.highlights.length
      ? `\n\n${draft.highlights.map((line) => `• ${line}`).join("\n")}`
      : ""
    const options = { shouldDirty: true, shouldValidate: true }
    setValue("description", `${draft.description}${highlights}`, options)
    if (categories.some((category) => category.id === draft.categoryId)) {
      setValue("categoryId", draft.categoryId, options)
    }
    setValue("pricePerDay", String(draft.suggestedPricePerDay), options)
    setPriceNote(
      t("priceNote", {
        amount: format.number(draft.suggestedPricePerDay),
        reason: draft.priceReason,
      })
    )
    setAiFilled(["description", "categoryId", "pricePerDay"])
    setTimeout(() => setAiFilled([]), 2400)
  }

  async function onSubmit(values: GearFormInput) {
    const res = gear
      ? await updateGear(gear.id, toGearUpdatePayload(values))
      : await createGear(toGearPayload(values))

    if (!res.success) {
      // The API returns 400 "Category not found" for a stale category list.
      if (/category/i.test(res.message)) {
        setError("categoryId", { message: res.message })
      }
      setError("root", { message: res.message })
      toast.error(res.message || (gear ? t("saveFailed") : t("createFailed")))
      return
    }

    queryClient.invalidateQueries({ queryKey: providerGearKeys.all })

    toast.success(
      gear
        ? t("updated", { name: values.name.trim() })
        : t("created", { name: values.name.trim() })
    )
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {errors.root && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorText(errors.root.message)}
        </p>
      )}

      <TextField
        id="gear-name"
        label={t("name")}
        placeholder={t("namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <ListingWriter
        read={() => {
          const values = getValues()
          return {
            name: values.name,
            brand: values.brand,
            categoryId: values.categoryId,
            notes: values.description,
            imageUrl: values.imageUrl,
          }
        }}
        onDraft={applyDraft}
      />

      <div className="grid gap-2">
        <Label htmlFor="gear-category" className="text-sm">
          {t("category")}
        </Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SelectField
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              value={field.value}
              onValueChange={field.onChange}
              id="gear-category"
              placeholder={t("categoryPlaceholder")}
              invalid={Boolean(errors.categoryId)}
              className={cn("h-10 w-full text-sm", flash("categoryId"))}
            />
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">
            {errorText(errors.categoryId.message)}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="gear-price"
          label={t("price")}
          inputMode="decimal"
          placeholder="450"
          hint={priceNote ?? undefined}
          error={errors.pricePerDay?.message}
          className={cn(flash("pricePerDay"))}
          {...register("pricePerDay")}
        />
        <TextField
          id="gear-stock"
          label={t("stock")}
          inputMode="numeric"
          placeholder="4"
          hint={t("stockHint")}
          error={errors.stock?.message}
          {...register("stock")}
        />
      </div>

      <TextField
        id="gear-deposit"
        label={
          <>
            {t("deposit")}{" "}
            <span className="font-normal text-muted-foreground">
              {t("optional")}
            </span>
          </>
        }
        inputMode="decimal"
        placeholder="0"
        hint={t("depositHint")}
        error={errors.depositAmount?.message}
        {...register("depositAmount")}
      />

      <TextField
        id="gear-brand"
        label={
          <>
            {t("brand")}{" "}
            <span className="font-normal text-muted-foreground">
              {t("optional")}
            </span>
          </>
        }
        placeholder="Coleman"
        error={errors.brand?.message}
        {...register("brand")}
      />

      <div className="grid gap-2">
        <Label htmlFor="gear-description" className="text-sm">
          {t("description")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <Textarea
          id="gear-description"
          rows={aiFilled.includes("description") || priceNote ? 6 : 3}
          placeholder={t("descriptionPlaceholder")}
          aria-invalid={errors.description ? true : undefined}
          className={cn("text-sm", flash("description"))}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errorText(errors.description.message)}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label className="text-sm">
          {t("photos")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <ImageGalleryEditor
          value={photos}
          onChange={setPhotos}
          max={MAX_GALLERY_IMAGES + 1}
        />
        {(errors.imageUrl || errors.images) && (
          <p className="text-xs text-destructive">
            {errorText(errors.imageUrl?.message) ?? t("photoInvalid")}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onDone}
          disabled={isSubmitting}
          className="h-9 text-sm"
        >
          {tc("cancel")}
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-9 text-sm"
        >
          {isSubmitting && (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          )}
          {isSubmitting
            ? tc("saving")
            : gear
              ? t("saveChanges")
              : t("createListing")}
        </Button>
      </DialogFooter>
    </form>
  )
}

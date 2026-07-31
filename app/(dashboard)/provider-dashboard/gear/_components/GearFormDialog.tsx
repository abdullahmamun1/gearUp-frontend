"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, Loader2, Plus, X } from "lucide-react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createGear } from "@/app/(dashboard)/_actions/createGear"
import { TextField } from "@/components/shared/TextField"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  emptyGearForm,
  gearFormSchema,
  MAX_GALLERY_IMAGES,
  toGearPayload,
  type GearFormInput,
} from "@/lib/schemas/gear"
import type { Category } from "@/types"

export function GearFormDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="h-9 text-sm">
            <Plus className="size-4" aria-hidden />
            Add gear
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add gear</DialogTitle>
          <DialogDescription>
            List a new item. It goes live as soon as you save.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <GearForm categories={categories} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function GearForm({
  categories,
  onDone,
}: {
  categories: Category[]
  onDone: () => void
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GearFormInput>({
    resolver: zodResolver(gearFormSchema),
    defaultValues: emptyGearForm,
  })

  const { fields, append, remove } = useFieldArray({ control, name: "images" })

  async function onSubmit(values: GearFormInput) {
    const res = await createGear(toGearPayload(values))

    if (!res.success) {
      if (/category/i.test(res.message)) {
        setError("categoryId", { message: res.message })
      }
      setError("root", { message: res.message })
      toast.error(res.message || "Couldn't create this listing.")
      return
    }

    toast.success(`"${values.name.trim()}" is now listed.`)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {errors.root && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <TextField
        id="gear-name"
        label="Name"
        placeholder="4-Person Dome Tent"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid gap-2">
        <Label htmlFor="gear-category" className="text-sm">
          Category
        </Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              items={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
            >
              <SelectTrigger
                id="gear-category"
                aria-invalid={errors.categoryId ? true : undefined}
                className="h-10 w-full text-sm"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="gear-price"
          label="Price per day (৳)"
          inputMode="decimal"
          placeholder="450"
          error={errors.pricePerDay?.message}
          {...register("pricePerDay")}
        />
        <TextField
          id="gear-stock"
          label="Stock"
          inputMode="numeric"
          placeholder="4"
          hint="How many you can rent out at once."
          error={errors.stock?.message}
          {...register("stock")}
        />
      </div>

      <TextField
        id="gear-brand"
        label={
          <>
            Brand{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </>
        }
        placeholder="Coleman"
        error={errors.brand?.message}
        {...register("brand")}
      />

      <div className="grid gap-2">
        <Label htmlFor="gear-description" className="text-sm">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="gear-description"
          rows={3}
          placeholder="Sleeps four, taped seams, packs to 55cm."
          aria-invalid={errors.description ? true : undefined}
          className="text-sm"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <TextField
        id="gear-image"
        label={
          <>
            Cover image URL{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </>
        }
        icon={ImagePlus}
        placeholder="https://res.cloudinary.com/…"
        error={errors.imageUrl?.message}
        {...register("imageUrl")}
      />

      <div className="grid gap-2">
        <Label className="text-sm">
          Gallery images{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>

        {fields.map((item, index) => (
          <div key={item.id} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                placeholder="https://…"
                aria-label={`Gallery image ${index + 1}`}
                aria-invalid={errors.images?.[index]?.url ? true : undefined}
                className="h-9 text-sm"
                {...register(`images.${index}.url` as const)}
              />
              {errors.images?.[index]?.url && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.images[index]?.url?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label={`Remove gallery image ${index + 1}`}
              className="size-9 shrink-0 text-muted-foreground"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        ))}

        <div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => append({ url: "" })}
            disabled={fields.length >= MAX_GALLERY_IMAGES}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" aria-hidden />
            Add image
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {fields.length}/{MAX_GALLERY_IMAGES} added. Blank rows are ignored.
          </p>
        </div>
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
          Cancel
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
          {isSubmitting ? "Saving…" : "Create listing"}
        </Button>
      </DialogFooter>
    </form>
  )
}

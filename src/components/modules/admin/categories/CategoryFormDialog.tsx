"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Pencil, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { createCategory } from "@/api/categories"
import { updateCategory } from "@/api/categories"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { categoriesKeys } from "@/hooks/queries/adminTables"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import {
  categoryFormSchema,
  emptyCategoryForm,
  toCategoryPayload,
  toCategoryUpdatePayload,
  toCategoryValues,
  type CategoryFormInput,
} from "@/validation/category"
import type { Category } from "@/types"

export function CategoryFormDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false)
  const editing = Boolean(category)
  const t = useTranslations("admin.categories")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("editAria", { name: category?.name ?? "" })}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button size="lg" className="h-9 text-sm">
              <Plus className="size-4" aria-hidden />
              {t("newCategory")}
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("editCategory") : t("newCategory")}
          </DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        {open && (
          <CategoryForm category={category} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({
  category,
  onDone,
}: {
  category?: Category
  onDone: () => void
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category ? toCategoryValues(category) : emptyCategoryForm,
  })

  const queryClient = useQueryClient()
  const t = useTranslations("admin.categories")
  const tc = useTranslations("common.actions")
  const errorText = useErrorMessage()

  async function onSubmit(values: CategoryFormInput) {
    const res = category
      ? await updateCategory(category.id, toCategoryUpdatePayload(values))
      : await createCategory(toCategoryPayload(values))

    if (!res.success) {
      const duplicate = /duplicate/i.test(res.message)
      const fallback = category ? t("saveFailed") : t("createFailed")
      const message = duplicate ? t("duplicate") : res.message || fallback

      setError(duplicate ? "name" : "root", { message })
      toast.error(message)
      return
    }

    queryClient.invalidateQueries({ queryKey: categoriesKeys.all })

    toast.success(
      category
        ? t("updated", { name: values.name.trim() })
        : t("added", { name: values.name.trim() })
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
        id="category-name"
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid gap-2">
        <Label htmlFor="category-description" className="text-sm">
          {t("descriptionLabel")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <Textarea
          id="category-description"
          rows={3}
          placeholder={t("descriptionPlaceholder")}
          aria-invalid={errors.description ? true : undefined}
          className="text-sm"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">
            {errorText(errors.description.message)}
          </p>
        ) : (
          category && (
            <p className="text-xs text-muted-foreground">{t("clearHint")}</p>
          )
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
            : category
              ? t("saveChanges")
              : t("createCategory")}
        </Button>
      </DialogFooter>
    </form>
  )
}

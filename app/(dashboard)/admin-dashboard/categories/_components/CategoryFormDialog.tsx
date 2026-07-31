"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createCategory } from "@/app/(dashboard)/_actions/createCategory"
import { updateCategory } from "@/app/(dashboard)/_actions/updateCategory"
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
import {
  categoryFormSchema,
  emptyCategoryForm,
  toCategoryPayload,
  toCategoryUpdatePayload,
  toCategoryValues,
  type CategoryFormInput,
} from "@/lib/schemas/category"
import type { Category } from "@/types"

export function CategoryFormDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false)
  const editing = Boolean(category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${category?.name}`}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button size="lg" className="h-9 text-sm">
              <Plus className="size-4" aria-hidden />
              New category
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Providers pick from these when listing gear.
          </DialogDescription>
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

  async function onSubmit(values: CategoryFormInput) {
    const res = category
      ? await updateCategory(category.id, toCategoryUpdatePayload(values))
      : await createCategory(toCategoryPayload(values))

    if (!res.success) {
      const duplicate = /duplicate/i.test(res.message)
      const fallback = category
        ? "Couldn't save this category."
        : "Couldn't create this category."
      const message = duplicate
        ? "A category with that name already exists."
        : res.message || fallback

      setError(duplicate ? "name" : "root", { message })
      toast.error(message)
      return
    }

    toast.success(
      category
        ? `"${values.name.trim()}" updated.`
        : `"${values.name.trim()}" added.`
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
          {errors.root.message}
        </p>
      )}

      <TextField
        id="category-name"
        label="Name"
        placeholder="Winter Sports"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid gap-2">
        <Label htmlFor="category-description" className="text-sm">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="category-description"
          rows={3}
          placeholder="Skis, boards, boots and cold-weather kit."
          aria-invalid={errors.description ? true : undefined}
          className="text-sm"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        ) : (
          category && (
            <p className="text-xs text-muted-foreground">
              Clear this field to remove the description.
            </p>
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
          {isSubmitting
            ? "Saving…"
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
      </DialogFooter>
    </form>
  )
}

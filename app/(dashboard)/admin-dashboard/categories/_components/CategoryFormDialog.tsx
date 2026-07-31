"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createCategory } from "@/app/(dashboard)/_actions/createCategory"
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
  type CategoryFormInput,
} from "@/lib/schemas/category"

export function CategoryFormDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="h-9 text-sm">
            <Plus className="size-4" aria-hidden />
            New category
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Providers pick from these when listing gear.
          </DialogDescription>
        </DialogHeader>

        {open && <CategoryForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  })

  async function onSubmit(values: CategoryFormInput) {
    const res = await createCategory(toCategoryPayload(values))

    if (!res.success) {
      const duplicate = /duplicate/i.test(res.message)
      const message = duplicate
        ? "A category with that name already exists."
        : res.message || "Couldn't create this category."

      setError(duplicate ? "name" : "root", { message })
      toast.error(message)
      return
    }

    toast.success(`"${values.name.trim()}" added.`)
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
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
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
          {isSubmitting ? "Saving…" : "Create category"}
        </Button>
      </DialogFooter>
    </form>
  )
}

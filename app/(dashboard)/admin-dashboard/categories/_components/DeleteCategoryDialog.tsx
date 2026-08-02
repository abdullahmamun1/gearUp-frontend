"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteCategory } from "@/app/(dashboard)/_actions/deleteCategory"
import { Button } from "@/components/ui/button"
import { categoriesKeys } from "@/lib/queries/adminTables"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Category } from "@/types"

export function DeleteCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const listings = category._count?.gearItems ?? 0

  const blocked = listings > 0

  function confirm() {
    setError(null)
    startTransition(async () => {
      const res = await deleteCategory(category.id)

      if (!res.success) {
        const message = res.message || "Couldn't delete this category."
        setError(message)
        toast.error(message)
        return
      }
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      setOpen(false)
      toast.success(`"${category.name}" deleted.`)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${category.name}`}
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {blocked ? "Can't delete this category" : "Delete this category?"}
          </DialogTitle>
          <DialogDescription>
            {blocked ? (
              <>
                <span className="font-medium text-foreground">
                  {category.name}
                </span>{" "}
                is still in use.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {category.name}
                </span>{" "}
                will be removed permanently. This can&apos;t be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {blocked && !error && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {listings === 1
              ? "1 listing is filed under it."
              : `${listings} listings are filed under it.`}{" "}
            Move them to another category first.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-9 text-sm"
          >
            {blocked ? "Close" : "Keep it"}
          </Button>
          {!blocked && (
            <Button
              variant="destructive"
              size="lg"
              onClick={confirm}
              disabled={isPending}
              className="h-9 text-sm"
            >
              {isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {isPending ? "Deleting…" : "Delete category"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

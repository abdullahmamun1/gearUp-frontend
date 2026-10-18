"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { deleteCategory } from "@/api/categories"
import { Button } from "@/components/ui/button"
import { categoriesKeys } from "@/hooks/queries/adminTables"
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
  const t = useTranslations("admin.categories")
  const tc = useTranslations("common.actions")

  const listings = category._count?.gearItems ?? 0

  const blocked = listings > 0

  function confirm() {
    setError(null)
    startTransition(async () => {
      const res = await deleteCategory(category.id)

      if (!res.success) {
        const message = res.message || t("deleteFailed")
        setError(message)
        toast.error(message)
        return
      }
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      setOpen(false)
      toast.success(t("deleted", { name: category.name }))
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
            aria-label={t("deleteAria", { name: category.name })}
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {blocked ? t("cantDeleteTitle") : t("deleteTitle")}
          </DialogTitle>
          <DialogDescription>
            {t.rich(blocked ? "inUse" : "willRemove", {
              name: category.name,
              strong: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        {blocked && !error && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {t("filedUnder", { count: listings })} {t("moveFirst")}
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
            {blocked ? tc("close") : t("keepIt")}
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
              {isPending ? t("deleting") : t("deleteCategory")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { deleteGear } from "@/api/gear"
import { providerGearKeys } from "@/hooks/queries/providerGear"
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
import type { GearItem } from "@/types"

export function DeleteGearDialog({ gear }: { gear: GearItem }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const t = useTranslations("provider.delete")

  const orderCount = gear._count?.orderItems ?? 0

  function confirm() {
    setError(null)
    startTransition(async () => {
      const res = await deleteGear(gear.id)

      if (!res.success) {
        setError(res.message || t("failed"))
        toast.error(res.message || t("failed"))
        return
      }
      queryClient.invalidateQueries({ queryKey: providerGearKeys.all })
      setOpen(false)
      toast.success(t("deleted", { name: gear.name }))
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
            aria-label={t("aria", { name: gear.name })}
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("description", {
              name: gear.name,
              strong: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        {orderCount > 0 && !error && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {t("orderRefs", { count: orderCount })} {t("runningNote")}
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
            {t("keep")}
          </Button>
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
            {isPending ? t("deleting") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

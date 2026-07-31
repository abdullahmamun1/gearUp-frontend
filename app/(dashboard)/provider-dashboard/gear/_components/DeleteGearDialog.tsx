"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteGear } from "@/app/(dashboard)/_actions/deleteGear"
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

  const orderCount = gear._count?.orderItems ?? 0

  function confirm() {
    setError(null)
    startTransition(async () => {
      const res = await deleteGear(gear.id)

      if (!res.success) {
        setError(res.message || "Couldn't delete this listing.")
        toast.error(res.message || "Couldn't delete this listing.")
        return
      }
      setOpen(false)
      toast.success(`"${gear.name}" deleted.`)
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
            aria-label={`Delete ${gear.name}`}
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this listing?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{gear.name}</span>{" "}
            will be removed permanently. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        {orderCount > 0 && !error && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {orderCount === 1
              ? "1 order references this listing."
              : `${orderCount} orders reference this listing.`}{" "}
            Deleting is only possible once none of them are still running.
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
            Keep it
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
            {isPending ? "Deleting…" : "Delete listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

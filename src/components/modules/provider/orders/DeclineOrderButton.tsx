"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useOrderAction } from "@/hooks/useOrderAction"

export function DeclineOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const { run, isPending } = useOrderAction(orderId)

  function decline() {
    run(
      { status: "CANCELLED", note: note.trim() || undefined },
      "Order declined. The customer has been told.",
      () => setOpen(false)
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="lg"
            className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            Decline
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline this request?</DialogTitle>
          <DialogDescription>
            The dates are released and the customer sees your reason. Nothing
            has been charged yet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor={`decline-${orderId}`} className="text-xs">
            Reason (optional)
          </Label>
          <Textarea
            id={`decline-${orderId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="e.g. The kayak is being repaired that week."
          />
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="h-9 text-sm">
                Keep it
              </Button>
            }
          />
          <Button
            variant="destructive"
            size="lg"
            onClick={decline}
            disabled={isPending}
            className="h-9 text-sm"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {isPending ? "Declining…" : "Decline request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

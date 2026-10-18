"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

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
  const t = useTranslations("provider.decline")

  function decline() {
    run(
      { status: "CANCELLED", note: note.trim() || undefined },
      t("done"),
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
            {t("trigger")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor={`decline-${orderId}`} className="text-xs">
            {t("reason")}
          </Label>
          <Textarea
            id={`decline-${orderId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder={t("placeholder")}
          />
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="h-9 text-sm">
                {t("keep")}
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
            {isPending ? t("declining") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

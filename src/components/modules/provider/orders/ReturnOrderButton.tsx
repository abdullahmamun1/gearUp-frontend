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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"

import { OrderStatusButton } from "./OrderStatusButton"
import { useOrderAction } from "@/hooks/useOrderAction"

/**
 * Orders holding a deposit ask about the gear's condition: good condition
 * refunds the deposit straight away, damage opens a claim for GearUp to review.
 */
export function ReturnOrderButton({
  orderId,
  deposit,
}: {
  orderId: string
  /** Deposit currently held; 0 when there's nothing to refund. */
  deposit: number
}) {
  const [open, setOpen] = useState(false)
  const [damaged, setDamaged] = useState(false)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const { run, isPending } = useOrderAction(orderId)
  const t = useTranslations("provider.return")
  const tc = useTranslations("common")
  const format = useFormat()

  if (deposit <= 0) {
    return (
      <OrderStatusButton
        orderId={orderId}
        next="RETURNED"
        label={tc("providerNextAction.PICKED_UP")}
      />
    )
  }

  const claim = Number(amount)
  const claimValid = claim > 0 && claim <= deposit && note.trim().length > 0

  function submit() {
    if (damaged) {
      run(
        {
          status: "RETURNED",
          condition: "DAMAGED",
          damageAmount: claim,
          note: note.trim(),
        },
        t("claimDone"),
        () => setOpen(false)
      )
      return
    }
    run(
      { status: "RETURNED", condition: "OK" },
      t("okDone", { amount: format.price(deposit) }),
      () => setOpen(false)
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="h-8 text-xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {tc("providerNextAction.PICKED_UP")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { amount: format.price(deposit) })}
          </DialogDescription>
        </DialogHeader>

        <div
          className="grid gap-2"
          role="radiogroup"
          aria-label={t("condition")}
        >
          <Choice
            selected={!damaged}
            onSelect={() => setDamaged(false)}
            title={t("good")}
            body={t("goodBody", { amount: format.price(deposit) })}
          />
          <Choice
            selected={damaged}
            onSelect={() => setDamaged(true)}
            title={t("damaged")}
            body={t("damagedBody")}
          />
        </div>

        {damaged && (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor={`claim-${orderId}`} className="text-xs">
                {t("claimLabel", { amount: format.price(deposit) })}
              </Label>
              <Input
                id={`claim-${orderId}`}
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`damage-${orderId}`} className="text-xs">
                {t("damageLabel")}
              </Label>
              <Textarea
                id={`damage-${orderId}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder={t("damagePlaceholder")}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="h-9 text-sm">
                {tc("actions.cancel")}
              </Button>
            }
          />
          <Button
            size="lg"
            onClick={submit}
            disabled={isPending || (damaged && !claimValid)}
            className="h-9 text-sm"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {isPending
              ? tc("actions.saving")
              : damaged
                ? t("submitClaim")
                : t("confirmReturn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Choice({
  selected,
  onSelect,
  title,
  body,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  body: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <span className="font-medium">{title}</span>
      <span className="block text-xs text-muted-foreground">{body}</span>
    </button>
  )
}

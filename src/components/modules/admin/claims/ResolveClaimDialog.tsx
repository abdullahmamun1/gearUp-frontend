"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Gavel, Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { resolveClaim } from "@/api/claims"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { attentionKeys, claimsKeys } from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import type { RentalOrder } from "@/types"

/**
 * Decide a damage claim: keep 0 to the whole deposit. Whatever isn't kept is
 * refunded to the customer's card, and both sides are emailed.
 */
export function ResolveClaimDialog({ order }: { order: RentalOrder }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations("admin.claims")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full">
            <Gavel aria-hidden />
            {t("decideClaim")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription", {
              name: order.customer?.name ?? t("theCustomer"),
            })}
          </DialogDescription>
        </DialogHeader>
        {open && <ResolveForm order={order} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ResolveForm({
  order,
  onDone,
}: {
  order: RentalOrder
  onDone: () => void
}) {
  const deposit = Number(order.depositAmount)
  const claimed = Math.min(Number(order.damageClaimAmount ?? 0), deposit)
  const [amount, setAmount] = useState(String(claimed))
  const [note, setNote] = useState("")
  const queryClient = useQueryClient()
  const t = useTranslations("admin.claims")
  const format = useFormat()

  const keep = Number(amount)
  const invalid =
    amount.trim() === "" || !Number.isFinite(keep) || keep < 0 || keep > deposit
  const refund = invalid ? 0 : Math.round((deposit - keep) * 100) / 100

  const presets = [
    { label: t("refundAll"), value: 0 },
    ...(claimed > 0 && claimed < deposit
      ? [{ label: t("providersClaim"), value: claimed }]
      : []),
    { label: t("keepAll"), value: deposit },
  ]

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await resolveClaim(order.id, {
        keepAmount: keep,
        ...(note.trim() && { note: note.trim() }),
      })
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      toast.success(
        refund > 0
          ? t("settledRefund", { amount: format.price(refund) })
          : t("settledKept")
      )
      queryClient.invalidateQueries({ queryKey: claimsKeys.all })
      queryClient.invalidateQueries({ queryKey: attentionKeys.all })
      onDone()
    },
    onError: (error) => toast.error(error.message || t("settleFailed")),
  })

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!invalid) mutate()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor={`keep-${order.id}`}>{t("amountLabel")}</Label>
        <Input
          id={`keep-${order.id}`}
          type="number"
          inputMode="decimal"
          min={0}
          max={deposit}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={`keep-help-${order.id}`}
        />
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setAmount(String(preset.value))}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent",
                keep === preset.value &&
                  !invalid &&
                  "border-primary bg-primary/10 text-primary"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p
          id={`keep-help-${order.id}`}
          className={cn(
            "text-xs",
            invalid ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {invalid
            ? t("invalidAmount", { max: format.price(deposit) })
            : t("depositLine", {
                deposit: format.price(deposit),
                claimed: format.price(claimed),
              })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("keptForProvider")}
          </p>
          <p className="font-semibold tabular-nums">
            {format.price(invalid ? 0 : keep)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("refundedToCustomer")}
          </p>
          <p className="font-semibold text-success tabular-nums">
            {format.price(refund)}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`note-${order.id}`}>
          {t("noteLabel")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <Textarea
          id={`note-${order.id}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t("notePlaceholder")}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={invalid || isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {refund > 0
            ? t("settleAndRefund", { amount: format.price(refund) })
            : t("settleClaim")}
        </Button>
      </DialogFooter>
    </form>
  )
}

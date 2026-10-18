"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Star } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createReview } from "@/api/reviews"
import { SelectField } from "@/components/shared/SelectField"
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
  MAX_REVIEW_COMMENT,
  emptyReviewForm,
  reviewFormSchema,
  toReviewPayload,
  type ReviewFormInput,
} from "@/validation/review"
import { useErrorMessage } from "@/hooks/useErrorMessage"
import { cn } from "@/lib/utils"
import type { OrderItem } from "@/types"

const RATINGS = ["1", "2", "3", "4", "5"] as const

export function ReviewDialog({
  orderId,
  items,
}: {
  orderId: string
  items: OrderItem[]
}) {
  const t = useTranslations("dashboard.customer.review")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="mt-3 h-9 w-full text-sm">
            <Star className="size-4" aria-hidden />
            {t("write")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("write")}</DialogTitle>
          <DialogDescription>
            {items.length > 1 ? t("descriptionMany") : t("descriptionOne")}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ReviewForm
            orderId={orderId}
            items={items}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ReviewForm({
  orderId,
  items,
  onDone,
}: {
  orderId: string
  items: OrderItem[]
  onDone: () => void
}) {
  const t = useTranslations("dashboard.customer.review")
  const tc = useTranslations("common.actions")
  const errorText = useErrorMessage()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: emptyReviewForm(items[0]?.gearItem?.id ?? ""),
  })

  const options = items
    .filter((item) => item.gearItem)
    .map((item) => ({
      value: item.gearItem!.id,
      label: item.gearItem!.name,
    }))

  async function onSubmit(values: ReviewFormInput) {
    const res = await createReview(toReviewPayload(orderId, values))

    if (!res.success) {
      const message = res.message || t("failed")
      setError("root", { message })
      toast.error(message)
      return
    }

    toast.success(t("success"))
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {errors.root && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorText(errors.root.message)}
        </p>
      )}

      {items.length > 1 && (
        <div className="grid gap-2">
          <Label htmlFor="review-gear" className="text-sm">
            {t("whichItem")}
          </Label>
          <Controller
            control={control}
            name="gearItemId"
            render={({ field }) => (
              <SelectField
                options={options}
                value={field.value}
                onValueChange={field.onChange}
                id="review-gear"
                placeholder={t("chooseItem")}
                invalid={Boolean(errors.gearItemId)}
                className="h-10 w-full text-sm"
              />
            )}
          />
          {errors.gearItemId && (
            <p className="text-xs text-destructive">
              {errorText(errors.gearItemId.message)}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Label className="text-sm">{t("rating")}</Label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label={t("rating")}
              className="flex items-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-label={t("stars", { count: star })}
                  aria-checked={Number(field.value) === star}
                  onClick={() => field.onChange(String(star))}
                  className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      "size-7",
                      star <= Number(field.value)
                        ? "fill-amber-500 text-amber-500"
                        : "fill-muted text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
              {field.value && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {RATINGS.includes(field.value as (typeof RATINGS)[number]) &&
                    t(`hint.${field.value as (typeof RATINGS)[number]}`)}
                </span>
              )}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-destructive">
            {errorText(errors.rating.message)}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="review-comment" className="text-sm">
          {t("comment")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <Textarea
          id="review-comment"
          rows={4}
          maxLength={MAX_REVIEW_COMMENT}
          placeholder={t("commentPlaceholder")}
          aria-invalid={errors.comment ? true : undefined}
          className="text-sm"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="text-xs text-destructive">
            {errorText(errors.comment.message)}
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
          {tc("cancel")}
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
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </DialogFooter>
    </form>
  )
}

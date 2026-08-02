"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Star } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createReview } from "@/app/(dashboard)/_actions/createReview"
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
} from "@/lib/schemas/review"
import { cn } from "@/lib/utils"
import type { OrderItem } from "@/types"

const RATING_HINT: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
}

export function ReviewDialog({
  orderId,
  items,
}: {
  orderId: string
  items: OrderItem[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="mt-3 h-9 w-full text-sm">
            <Star className="size-4" aria-hidden />
            Write a review
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            {items.length > 1
              ? "You can review one item from this rental."
              : "Tell other renters how it went."}
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
      const message = res.message || "Couldn't submit your review."
      setError("root", { message })
      toast.error(message)
      return
    }

    toast.success("Thanks — your review is live.")
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

      {items.length > 1 && (
        <div className="grid gap-2">
          <Label htmlFor="review-gear" className="text-sm">
            Which item?
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
                placeholder="Choose an item"
                invalid={Boolean(errors.gearItemId)}
                className="h-10 w-full text-sm"
              />
            )}
          />
          {errors.gearItemId && (
            <p className="text-xs text-destructive">
              {errors.gearItemId.message}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Label className="text-sm">Rating</Label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="Rating"
              className="flex items-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
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
                  {RATING_HINT[Number(field.value)]}
                </span>
              )}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="review-comment" className="text-sm">
          Comment{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="review-comment"
          rows={4}
          maxLength={MAX_REVIEW_COMMENT}
          placeholder="How was the gear? Anything the next renter should know?"
          aria-invalid={errors.comment ? true : undefined}
          className="text-sm"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="text-xs text-destructive">{errors.comment.message}</p>
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
          {isSubmitting ? "Submitting…" : "Submit review"}
        </Button>
      </DialogFooter>
    </form>
  )
}

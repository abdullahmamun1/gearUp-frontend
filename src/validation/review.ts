import { z } from "zod"

export const MAX_REVIEW_COMMENT = 1000

export const reviewFormSchema = z.object({
  rating: z
    .string()
    .min(1, "dashboard.validation.ratingRequired")
    .refine(
      (value) => /^[1-5]$/.test(value),
      "dashboard.validation.ratingRange"
    ),
  comment: z
    .string()
    .trim()
    .max(MAX_REVIEW_COMMENT, "dashboard.validation.commentTooLong")
    .optional(),
  gearItemId: z.uuid("dashboard.validation.gearRequired"),
})

export type ReviewFormInput = z.infer<typeof reviewFormSchema>

export type ReviewPayload = {
  rentalOrderId: string
  gearItemId: string
  rating: number
  comment?: string
}

export function emptyReviewForm(gearItemId: string): ReviewFormInput {
  return { rating: "", comment: "", gearItemId }
}

export function toReviewPayload(
  rentalOrderId: string,
  values: ReviewFormInput
): ReviewPayload {
  const comment = values.comment?.trim()
  return {
    rentalOrderId,
    gearItemId: values.gearItemId,
    rating: Number(values.rating),
    ...(comment ? { comment } : {}),
  }
}

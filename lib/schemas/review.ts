import { z } from "zod"

export const MAX_REVIEW_COMMENT = 1000

export const reviewFormSchema = z.object({
  rating: z
    .string()
    .min(1, "Pick a rating.")
    .refine((value) => /^[1-5]$/.test(value), "Pick a rating between 1 and 5."),
  comment: z
    .string()
    .trim()
    .max(
      MAX_REVIEW_COMMENT,
      `Comment must be at most ${MAX_REVIEW_COMMENT} characters.`
    )
    .optional(),
  gearItemId: z.uuid("Choose which item you're reviewing."),
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

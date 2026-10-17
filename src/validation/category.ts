import { z } from "zod"

import type { Category } from "@/types"

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be at most 60 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters.")
    .optional(),
})

export type CategoryFormInput = z.infer<typeof categoryFormSchema>

export type CategoryPayload = {
  name: string
  description?: string
}

export const emptyCategoryForm: CategoryFormInput = {
  name: "",
  description: "",
}

export function toCategoryPayload(values: CategoryFormInput): CategoryPayload {
  const description = values.description?.trim()
  return {
    name: values.name.trim(),
    ...(description ? { description } : {}),
  }
}

export function toCategoryValues(category: Category): CategoryFormInput {
  return {
    name: category.name,
    description: category.description ?? "",
  }
}

export function toCategoryUpdatePayload(
  values: CategoryFormInput
): Required<CategoryPayload> {
  return {
    name: values.name.trim(),
    description: values.description?.trim() ?? "",
  }
}

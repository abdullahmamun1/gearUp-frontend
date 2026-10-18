import { z } from "zod"

import type { GearItem } from "@/types"

export const MAX_GALLERY_IMAGES = 8

const DECIMAL = /^\d+(\.\d+)?$/
const WHOLE = /^\d+$/

const optionalUrl = z.union([
  z.literal(""),
  z.url("provider.validation.urlInvalid"),
])

export const gearFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "provider.validation.nameMin")
    .max(120, "provider.validation.nameMax"),
  categoryId: z.uuid("provider.validation.categoryRequired"),
  pricePerDay: z
    .string()
    .trim()
    .min(1, "provider.validation.priceRequired")
    .regex(DECIMAL, "provider.validation.priceNumber")
    .refine((value) => Number(value) > 0, "provider.validation.pricePositive")
    .refine(
      (value) => Number(value) <= 1000000,
      "provider.validation.priceTooHigh"
    ),
  depositAmount: z
    .string()
    .trim()
    .regex(DECIMAL, "provider.validation.depositNumber")
    .refine(
      (value) => Number(value) <= 1000000,
      "provider.validation.depositTooHigh"
    )
    .or(z.literal(""))
    .optional(),
  stock: z
    .string()
    .trim()
    .min(1, "provider.validation.stockRequired")
    .regex(WHOLE, "provider.validation.stockWhole"),
  brand: z.string().trim().max(80, "provider.validation.brandMax").optional(),
  description: z
    .string()
    .trim()
    .max(2000, "provider.validation.descriptionMax")
    .optional(),
  imageUrl: optionalUrl.optional(),
  images: z
    .array(z.object({ url: optionalUrl }))
    .max(MAX_GALLERY_IMAGES, "provider.validation.galleryMax")
    .optional(),
})

export type GearFormInput = z.infer<typeof gearFormSchema>

export type GearPayload = {
  name: string
  categoryId: string
  pricePerDay: number
  depositAmount?: number
  stock: number
  brand?: string
  description?: string
  imageUrl?: string
  images?: string[]
}

export type GearUpdatePayload = Required<Omit<GearPayload, "images">> & {
  images: string[]
}

export type GearPatch = Partial<GearUpdatePayload> & { isAvailable?: boolean }

export const emptyGearForm: GearFormInput = {
  name: "",
  categoryId: "",
  pricePerDay: "",
  depositAmount: "",
  stock: "",
  brand: "",
  description: "",
  imageUrl: "",
  images: [],
}

export function toGearFormValues(gear: GearItem): GearFormInput {
  return {
    name: gear.name,
    categoryId: gear.categoryId,
    pricePerDay: String(Number(gear.pricePerDay)),
    depositAmount:
      Number(gear.depositAmount ?? 0) > 0
        ? String(Number(gear.depositAmount))
        : "",
    stock: String(gear.stock),
    brand: gear.brand ?? "",
    description: gear.description ?? "",
    imageUrl: gear.imageUrl ?? "",
    images: (gear.images ?? []).map((url) => ({ url })),
  }
}

export function toGearUpdatePayload(values: GearFormInput): GearUpdatePayload {
  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    pricePerDay: Number(values.pricePerDay),
    depositAmount: Number(values.depositAmount || 0),
    stock: Number(values.stock),
    brand: values.brand?.trim() ?? "",
    description: values.description?.trim() ?? "",
    imageUrl: values.imageUrl?.trim() ?? "",
    images: (values.images ?? [])
      .map((image) => image.url.trim())
      .filter(Boolean),
  }
}

export function toGearPayload(values: GearFormInput): GearPayload {
  const images = (values.images ?? [])
    .map((image) => image.url.trim())
    .filter(Boolean)

  const brand = values.brand?.trim()
  const description = values.description?.trim()
  const imageUrl = values.imageUrl?.trim()
  const depositAmount = Number(values.depositAmount || 0)

  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    pricePerDay: Number(values.pricePerDay),
    stock: Number(values.stock),
    ...(depositAmount > 0 ? { depositAmount } : {}),
    ...(brand ? { brand } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(images.length ? { images } : {}),
  }
}

import { z } from "zod"

import type { GearItem } from "@/types"

export const MAX_GALLERY_IMAGES = 8

const DECIMAL = /^\d+(\.\d+)?$/
const WHOLE = /^\d+$/

const optionalUrl = z.union([
  z.literal(""),
  z.url("Enter a valid URL, starting with https://"),
])

export const gearFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be at most 120 characters."),
  categoryId: z.uuid("Choose a category."),
  pricePerDay: z
    .string()
    .trim()
    .min(1, "Enter a price per day.")
    .regex(DECIMAL, "Enter a number, like 450 or 450.50.")
    .refine((value) => Number(value) > 0, "Price must be greater than 0.")
    .refine(
      (value) => Number(value) <= 1000000,
      "Price per day is unrealistically high."
    ),
  stock: z
    .string()
    .trim()
    .min(1, "Enter how many you have.")
    .regex(WHOLE, "Stock must be a whole number, 0 or more."),
  brand: z
    .string()
    .trim()
    .max(80, "Brand must be at most 80 characters.")
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters.")
    .optional(),
  imageUrl: optionalUrl.optional(),
  images: z
    .array(z.object({ url: optionalUrl }))
    .max(
      MAX_GALLERY_IMAGES,
      `A listing can have at most ${MAX_GALLERY_IMAGES} gallery images.`
    )
    .optional(),
})

export type GearFormInput = z.infer<typeof gearFormSchema>

export type GearPayload = {
  name: string
  categoryId: string
  pricePerDay: number
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

  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    pricePerDay: Number(values.pricePerDay),
    stock: Number(values.stock),
    ...(brand ? { brand } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(images.length ? { images } : {}),
  }
}

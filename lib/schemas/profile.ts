import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{5,19}$/, "Enter a valid phone number.")
    .or(z.literal(""))
    .optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

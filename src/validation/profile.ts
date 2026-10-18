import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().trim().min(2, "dashboard.validation.nameRequired"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{5,19}$/, "dashboard.validation.phoneInvalid")
    .or(z.literal(""))
    .optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

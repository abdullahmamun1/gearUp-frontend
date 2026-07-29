import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s()-]{5,19}$/, "Enter a valid phone number.")
      .or(z.literal(""))
      .optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      error: "Choose how you'll use GearUp.",
    }),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

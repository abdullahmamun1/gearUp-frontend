import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("auth.validation.emailInvalid"),
  password: z.string().min(1, "auth.validation.passwordRequired"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "auth.validation.nameRequired"),
    email: z.email("auth.validation.emailInvalid"),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s()-]{5,19}$/, "auth.validation.phoneInvalid")
      .or(z.literal(""))
      .optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      error: "auth.validation.roleRequired",
    }),
    password: z
      .string()
      .min(8, "auth.validation.passwordMin")
      .max(128, "auth.validation.passwordMax"),
    confirmPassword: z.string().min(1, "auth.validation.confirmRequired"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "auth.validation.passwordsMismatch",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.email("auth.validation.emailInvalid"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "auth.validation.passwordMin")
      .max(128, "auth.validation.passwordMax"),
    confirmPassword: z.string().min(1, "auth.validation.confirmNewRequired"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "auth.validation.passwordsMismatch",
    path: ["confirmPassword"],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

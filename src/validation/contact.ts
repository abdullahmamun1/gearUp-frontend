import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().trim().min(2, "pages.validation.nameRequired"),
  email: z.email("pages.validation.emailInvalid"),
  subject: z
    .string()
    .trim()
    .min(3, "pages.validation.subjectMin")
    .max(120, "pages.validation.subjectMax"),
  message: z
    .string()
    .trim()
    .min(20, "pages.validation.messageMin")
    .max(2000, "pages.validation.messageMax"),
})

export type ContactInput = z.infer<typeof contactSchema>

export const emptyContactForm: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

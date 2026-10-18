import { z } from "zod"

export const newsletterSchema = z.object({
  email: z.email("pages.validation.emailInvalid"),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

export const emptyNewsletterForm: NewsletterInput = { email: "" }

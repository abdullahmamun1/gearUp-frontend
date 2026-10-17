import { z } from "zod"

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address."),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

export const emptyNewsletterForm: NewsletterInput = { email: "" }

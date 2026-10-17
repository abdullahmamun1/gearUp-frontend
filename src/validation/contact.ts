import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.email("Enter a valid email address."),
  subject: z
    .string()
    .trim()
    .min(3, "Add a short subject.")
    .max(120, "Subject must be at most 120 characters."),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more — at least 20 characters.")
    .max(2000, "Message must be at most 2000 characters."),
})

export type ContactInput = z.infer<typeof contactSchema>

export const emptyContactForm: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

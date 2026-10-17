import { CircleAlert } from "lucide-react"

/** The banner for a form-level error (wrong password, taken email…). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="flex animate-in items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive duration-300 fade-in slide-in-from-top-1 motion-reduce:animate-none"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  )
}

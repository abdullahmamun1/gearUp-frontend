import { notFound } from "next/navigation"

/** Any unknown path inside a locale renders that locale's 404 page. */
export default function CatchAll() {
  notFound()
}

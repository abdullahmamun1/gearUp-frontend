import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
export const metadata: Metadata = {
  title: "GearUp — Rent sports & outdoor gear instantly",
  description:
    "Browse and rent tents, kayaks, bikes and more by the day from local providers.",
}

export default async function HomePage() {
  return <>Hero</>
}

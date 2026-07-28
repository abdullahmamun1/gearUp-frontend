import type { Metadata } from "next"
import { Hero } from "./_components/home/Hero"

export const metadata: Metadata = {
  title: "GearUp — Rent sports & outdoor gear instantly",
  description:
    "Browse and rent tents, kayaks, bikes and more by the day from local providers.",
}

export default async function HomePage() {
  return (
    <>
      <Hero />
    </>
  )
}

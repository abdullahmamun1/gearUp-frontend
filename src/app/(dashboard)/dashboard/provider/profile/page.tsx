import type { Metadata } from "next"

import { ProfilePanel } from "@/components/modules/dashboard/ProfilePanel"

export const metadata: Metadata = { title: "Profile · GearUp" }

export default function ProfilePage() {
  return <ProfilePanel />
}

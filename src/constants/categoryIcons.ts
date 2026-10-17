import {
  Bike,
  Footprints,
  Mountain,
  Package,
  Tent,
  Trophy,
  Waves,
  type LucideIcon,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  camping: Tent,
  climbing: Mountain,
  cycling: Bike,
  "hiking & trekking": Footprints,
  "team sports": Trophy,
  "water sports": Waves,
}

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name.trim().toLowerCase()] ?? Package
}

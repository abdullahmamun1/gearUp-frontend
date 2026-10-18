"use client"

import { usePathname, useRouter } from "@/i18n/navigation"
import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Heart } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { useFavorites, useToggleFavorite } from "@/hooks/queries/favorites"
import { useHydrated } from "@/hooks/useHydrated"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  return { x: Math.cos(angle) * 22, y: Math.sin(angle) * 22 }
})

/**
 * Save to the wishlist. A client island, so it works on static pages: the
 * filled state arrives once the customer's favourites load. Signed-out
 * visitors are sent to log in; providers and admins don't see it.
 */
export function FavoriteButton({
  gearId,
  gearName,
  variant = "overlay",
  className,
}: {
  gearId: string
  gearName: string
  /** "overlay" floats on a photo; "outline" sits beside other buttons. */
  variant?: "overlay" | "outline"
  className?: string
}) {
  const t = useTranslations("gear.favorite")
  const router = useRouter()
  const pathname = usePathname()
  const { user, isPending } = useSessionUser()
  const favorites = useFavorites()
  const toggle = useToggleFavorite()
  const reduced = useReducedMotion()
  const [burst, setBurst] = useState(0)

  // Match the server's HTML while hydrating, then show the user's state.
  const hydrated = useHydrated()
  if (hydrated && user && user.role !== "CUSTOMER") return null

  const saved = hydrated && favorites.ids.has(gearId)

  function onClick(event: React.MouseEvent) {
    // Inside a card that is one big link: don't follow it.
    event.preventDefault()
    event.stopPropagation()
    if (isPending) return
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
      return
    }
    if (!saved) setBurst((count) => count + 1)
    toggle.mutate({ gearId, save: !saved })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={
        saved ? t("remove", { name: gearName }) : t("save", { name: gearName })
      }
      title={saved ? t("savedTitle") : t("saveTitle")}
      className={cn(
        "relative z-10 grid shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,transform] outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
        variant === "overlay"
          ? "size-9 border border-white/25 bg-black/35 text-white backdrop-blur-md hover:bg-black/50"
          : "size-11 border bg-card text-foreground shadow-xs hover:bg-accent",
        className
      )}
    >
      <motion.span
        key={burst}
        className="grid place-items-center"
        initial={reduced || burst === 0 ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 12 }}
      >
        <Heart
          className={cn(
            "size-[18px] transition-colors",
            saved && "fill-ember text-ember"
          )}
          aria-hidden
        />
      </motion.span>

      <AnimatePresence>
        {!reduced && burst > 0 && saved && (
          <span
            key={burst}
            aria-hidden
            className="pointer-events-none absolute inset-0"
          >
            {PARTICLES.map((particle, index) => (
              <motion.span
                key={index}
                className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-ember"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
    </button>
  )
}

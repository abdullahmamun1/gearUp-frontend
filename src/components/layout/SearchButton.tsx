"use client"

import { useSyncExternalStore } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { openCommandPalette } from "./CommandPalette"

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)

/** Opens the ⌘K palette. A search field look on wide screens, an icon below. */
export function SearchButton({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const mac = useSyncExternalStore(
    () => () => {},
    isMac,
    () => true
  )

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={openCommandPalette}
        aria-label="Search"
        className={cn("size-11 rounded-full", className)}
      >
        <Search className="size-[18px]" aria-hidden />
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={cn(
        "group flex h-11 w-60 cursor-pointer items-center gap-2.5 rounded-full border bg-card/70 pr-2 pl-4 text-[15px] text-muted-foreground shadow-xs transition-colors outline-none hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Search className="size-4" aria-hidden />
      <span className="flex-1 text-left">Search gear…</span>
      <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  )
}

"use client"

import { ChevronDown, Download } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ExportType } from "@/types"
import type { AnalyticsRange } from "@/utils/filters/admin"
import { toQueryString } from "@/utils/searchParams"

/** Labels are keys under `admin.analytics.export`. */
const EXPORTS: ExportType[] = ["rentals", "payments", "users", "subscribers"]

export function exportHref(type: ExportType, range: AnalyticsRange = {}) {
  const query = toQueryString({ ...range })
  return `/api/admin/export/${type}${query ? `?${query}` : ""}`
}

/** CSV downloads, limited to the range on screen when there is one. */
export function ExportMenu({
  range,
  only,
}: {
  range?: AnalyticsRange
  /** A single export: renders a plain button instead of a menu. */
  only?: ExportType
}) {
  const t = useTranslations("admin.analytics.export")

  if (only) {
    return (
      <a
        href={exportHref(only, range)}
        download
        className={buttonVariants({ variant: "outline" })}
      >
        <Download aria-hidden />
        {t("button")}
      </a>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <Download aria-hidden />
            {t("button")}
            <ChevronDown className="opacity-60" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {range?.from || range?.to ? t("inRange") : t("everything")}
          </DropdownMenuLabel>
          {EXPORTS.map((type) => (
            <DropdownMenuItem
              key={type}
              render={<a href={exportHref(type, range)} download />}
            >
              {t(type)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

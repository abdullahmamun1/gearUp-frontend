"use client"

import { Download } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"

/** "Install app" in account menus; only when the browser offers it. */
export function InstallAppMenuItem() {
  const t = useTranslations("common.install")
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null

  return (
    <DropdownMenuItem
      onClick={async () => {
        if (await install()) toast.success(t("done"))
      }}
    >
      <Download aria-hidden />
      {t("label")}
    </DropdownMenuItem>
  )
}

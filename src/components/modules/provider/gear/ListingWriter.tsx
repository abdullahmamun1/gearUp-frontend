"use client"

import { useTransition } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { draftListing } from "@/api/ai"
import { Button } from "@/components/ui/button"
import type { ListingDraft } from "@/types"

export type ListingWriterInput = {
  name: string
  brand?: string
  categoryId?: string
  notes?: string
  imageUrl?: string
}

/**
 * "Write with AI" for the gear form. Reads what the provider has typed so far
 * and hands back a draft; the form decides what to fill in. Nothing is saved.
 */
export function ListingWriter({
  read,
  onDraft,
}: {
  /** Current form values, read at click time. */
  read: () => ListingWriterInput
  onDraft: (draft: ListingDraft) => void
}) {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("provider.writer")
  const locale = useLocale()

  function write() {
    const input = read()
    if (input.name.trim().length < 2) {
      toast.error(t("needName"))
      return
    }
    startTransition(async () => {
      const res = await draftListing({
        name: input.name.trim(),
        brand: input.brand?.trim() || undefined,
        categoryId: input.categoryId || undefined,
        notes: input.notes?.trim().slice(0, 600) || undefined,
        imageUrl: input.imageUrl?.trim() || undefined,
        locale,
      })
      if (!res.success) {
        toast.error(res.message || t("failed"))
        return
      }
      onDraft(res.data)
      toast.success(t("done"))
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-xs text-muted-foreground">
        <span className="block text-sm font-semibold text-foreground">
          {t("title")}
        </span>
        {t("body")}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={write}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Sparkles aria-hidden />
        )}
        {isPending ? t("writing") : t("write")}
      </Button>
    </div>
  )
}

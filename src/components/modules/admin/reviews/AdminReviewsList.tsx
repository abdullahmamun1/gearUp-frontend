"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { moderateReview } from "@/api/admin"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { Stars } from "@/components/shared/Stars"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  adminReviewsKeys,
  useAdminReviews,
} from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import type { Paginated, Review } from "@/types"
import {
  ADMIN_REVIEWS_PATH,
  type AdminReviewsFilters,
} from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

export function AdminReviewsList({
  filters,
  initialData,
}: {
  filters: AdminReviewsFilters
  initialData: Paginated<Review>
}) {
  const { data, error, isFetching } = useAdminReviews(filters, initialData)
  const t = useTranslations("admin.reviews")
  const format = useFormat()
  const headings = [
    t("headingReview"),
    t("headingGear"),
    t("headingCustomer"),
    t("headingDate"),
    t("headingVisibility"),
  ]

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const reviews = data?.data ?? []
  const meta = data?.meta

  if (reviews.length === 0) {
    return <EmptyState>{t("noMatch")}</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: meta?.total ?? reviews.length,
          one: t("countOne"),
          many: t("countMany"),
        }}
        isFetching={isFetching}
      >
        {reviews.map((review) => (
          <TableRow
            key={review.id}
            className={cn(
              "align-top hover:bg-transparent",
              review.isHidden && "bg-muted/40"
            )}
          >
            <TableCell className="max-w-md min-w-64 whitespace-normal">
              <Stars rating={review.rating} />
              <p
                className={cn(
                  "mt-1.5 text-sm text-pretty",
                  review.isHidden && "text-muted-foreground line-through"
                )}
              >
                {review.comment || (
                  <span className="text-muted-foreground italic">
                    {t("noComment")}
                  </span>
                )}
              </p>
            </TableCell>
            <TableCell>
              {review.gearItem ? <GearCell item={review.gearItem} /> : "—"}
            </TableCell>
            <TableCell>
              {review.customer?.name ?? "—"}
              {review.customer?.email && (
                <p className="text-xs text-muted-foreground">
                  {review.customer.email}
                </p>
              )}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {review.createdAt ? format.date(review.createdAt) : "—"}
            </TableCell>
            <TableCell>
              <ModerateButton review={review} filters={filters} />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_REVIEWS_PATH, { ...filters, page })}
        label={t("pagination")}
      />
    </>
  )
}

function ModerateButton({
  review,
  filters,
}: {
  review: Review
  filters: AdminReviewsFilters
}) {
  const queryClient = useQueryClient()
  const queryKey = adminReviewsKeys.list(filters)
  const t = useTranslations("admin.reviews")

  const { mutate, isPending } = useMutation({
    mutationFn: async (isHidden: boolean) => {
      const res = await moderateReview(review, isHidden)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onMutate: async (isHidden) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Paginated<Review>>(queryKey)
      queryClient.setQueryData<Paginated<Review>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((row) =>
                row.id === review.id ? { ...row, isHidden } : row
              ),
            }
          : current
      )
      return { previous }
    },
    onError: (error, _value, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous)
      toast.error(error.message || t("updateFailed"))
    },
    onSuccess: (_data, isHidden) =>
      toast.success(isHidden ? t("hiddenToast") : t("restoredToast")),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: adminReviewsKeys.all }),
  })

  return (
    <div className="flex flex-col items-start gap-2">
      {review.isHidden ? (
        <Badge variant="secondary">{t("hidden")}</Badge>
      ) : (
        <Badge variant="success">{t("visible")}</Badge>
      )}
      <Button
        variant={review.isHidden ? "outline" : "ghost"}
        size="sm"
        onClick={() => mutate(!review.isHidden)}
        disabled={isPending}
        className={cn(
          !review.isHidden && "text-destructive hover:text-destructive"
        )}
      >
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : review.isHidden ? (
          <Eye aria-hidden />
        ) : (
          <EyeOff aria-hidden />
        )}
        {review.isHidden ? t("restore") : t("hide")}
      </Button>
    </div>
  )
}

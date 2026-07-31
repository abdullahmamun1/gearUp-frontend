import Image from "next/image"
import Link from "next/link"
import { Backpack } from "lucide-react"

import { getProviderGear } from "@/app/(dashboard)/_actions/getProviderGear"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatPrice } from "@/lib/format"
import {
  buildProviderGearHref,
  hasActiveProviderGearFilters,
  toProviderGearQuery,
  type ProviderGearFilters,
} from "@/lib/providerGearQuery"
import type { Category, GearItem } from "@/types"

import { GearFormDialog } from "./GearFormDialog"

export async function ProviderGearTable({
  filters,
  categories,
}: {
  filters: ProviderGearFilters
  categories: Category[]
}) {
  const res = await getProviderGear(toProviderGearQuery(filters))

  if (!res.success) {
    return (
      <Message>
        {res.message || "Couldn't load your listings. Please try again."}
      </Message>
    )
  }

  const gear = res.data?.data ?? []
  const meta = res.data?.meta
  const total = meta?.total ?? gear.length

  if (gear.length === 0) {
    return (
      <Message>
        {hasActiveProviderGearFilters(filters)
          ? "No listings match those filters. Try clearing one."
          : "You haven't listed any gear yet."}
      </Message>
    )
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {total} {total === 1 ? "listing" : "listings"}
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price / day</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gear.map((item) => (
              <TableRow key={item.id} className="hover:bg-transparent">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Thumbnail item={item} />
                    <div className="min-w-0">
                      <Link
                        href={`/gear/${item.id}`}
                        className="font-medium transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      {item.brand && (
                        <p className="text-xs text-muted-foreground">
                          {item.brand}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.category?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(item.pricePerDay)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.stock}
                </TableCell>
                <TableCell>
                  <ListingStatus item={item} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {item.createdAt ? formatDate(item.createdAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <GearFormDialog categories={categories} gear={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildProviderGearHref({ ...filters, page })}
        label="Listings pagination"
      />
    </>
  )
}

function Thumbnail({ item }: { item: GearItem }) {
  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Backpack
            className="size-4 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}

function ListingStatus({ item }: { item: GearItem }) {
  if (!item.isAvailable) return <Badge variant="secondary">Unavailable</Badge>
  if (item.stock < 1) return <Badge variant="outline">Out of stock</Badge>
  return <Badge>Available</Badge>
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed p-12 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

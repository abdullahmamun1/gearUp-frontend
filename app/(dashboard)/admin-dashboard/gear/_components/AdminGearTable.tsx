import Image from "next/image"
import Link from "next/link"
import { Backpack } from "lucide-react"

import { getAdminGear } from "@/app/(dashboard)/_actions/getAdminTables"
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
import {
  ADMIN_GEAR_PATH,
  buildAdminHref,
  type AdminGearFilters,
} from "@/lib/adminQuery"
import { formatPrice } from "@/lib/format"
import type { GearItem } from "@/types"

import { AdminMessage } from "../../_components/AdminMessage"

export async function AdminGearTable({
  filters,
}: {
  filters: AdminGearFilters
}) {
  const res = await getAdminGear(filters)

  if (!res.success) {
    return (
      <AdminMessage>
        {res.message || "Couldn't load listings. Please try again."}
      </AdminMessage>
    )
  }

  const gear = res.data?.data ?? []
  const meta = res.data?.meta
  const total = meta?.total ?? gear.length

  if (gear.length === 0) {
    return <AdminMessage>No gear has been listed yet.</AdminMessage>
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
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Price / day</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>
                  {item.provider?.name ?? "—"}
                  {item.provider?.email && (
                    <p className="text-xs text-muted-foreground">
                      {item.provider.email}
                    </p>
                  )}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildAdminHref(ADMIN_GEAR_PATH, { page })}
        label="Gear pagination"
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
  return (
    <Badge variant="outline" className="border-success/40 text-success">
      Available
    </Badge>
  )
}

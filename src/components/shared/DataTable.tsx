import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type Heading = string | { label: string; align: "right" }

export function DataTable({
  headings,
  count,
  isFetching,
  children,
}: {
  headings: readonly Heading[]
  count?: { total: number; one: string; many: string }
  isFetching?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      {count && (
        <p className="mb-3 text-sm text-muted-foreground">
          {count.total} {count.total === 1 ? count.one : count.many}
        </p>
      )}

      <div
        className={cn(
          "overflow-x-auto rounded-xl border transition-opacity",
          isFetching && "opacity-60"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {headings.map((heading) => {
                const label =
                  typeof heading === "string" ? heading : heading.label

                return (
                  <TableHead
                    key={label}
                    className={
                      typeof heading === "string" ? undefined : "text-right"
                    }
                  >
                    {label}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </>
  )
}

import type { ChartSeries } from "../_actions/getAdminCharts"

export function ChartCard({
  title,
  description,
  series,
  columns,
  children,
}: {
  title: string
  description: string
  columns: [dimension: string, measure: string]
  series: ChartSeries
  children: React.ReactNode
}) {
  const total = series.data.reduce((sum, row) => sum + row.value, 0)

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>

      {series.failed && (
        <p className="mt-3 text-xs text-destructive">
          Some of this chart could not be loaded.
        </p>
      )}

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing to chart yet.
        </p>
      ) : (
        <>
          <div className="mt-4">{children}</div>

          <details className="group mt-2">
            <summary className="cursor-pointer list-none text-xs text-muted-foreground underline-offset-4 hover:underline">
              <span className="group-open:hidden">View as table</span>
              <span className="hidden group-open:inline">Hide table</span>
            </summary>

            <table className="mt-2 w-full text-xs">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="py-1.5 text-left font-medium">
                    {columns[0]}
                  </th>
                  <th scope="col" className="py-1.5 text-right font-medium">
                    {columns[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {series.data.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {row.label}
                    </th>
                    <td className="py-1.5 text-right tabular-nums">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  )
}

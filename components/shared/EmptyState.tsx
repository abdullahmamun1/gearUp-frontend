import { cn } from "@/lib/utils"

export function EmptyState({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl border border-dashed p-12 text-center",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  )
}

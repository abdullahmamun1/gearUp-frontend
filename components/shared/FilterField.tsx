import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function FilterField({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

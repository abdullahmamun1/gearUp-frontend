import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  isPending,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  isPending?: boolean
}) {
  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-9 pr-9 pl-9 text-sm"
      />
      {isPending && (
        <Loader2
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}
    </div>
  )
}

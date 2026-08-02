"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectOption = { value: string; label: string }

export function SelectField({
  options,
  value,
  onValueChange,
  id,
  placeholder,
  invalid,
  className,
  "aria-label": ariaLabel,
}: {
  options: readonly SelectOption[]
  value: string | undefined
  onValueChange: (value: string) => void
  id?: string
  placeholder?: string
  invalid?: boolean
  className?: string
  "aria-label"?: string
}) {
  return (
    <Select
      items={options as SelectOption[]}
      value={value || null}
      onValueChange={(next) => onValueChange(next == null ? "" : String(next))}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

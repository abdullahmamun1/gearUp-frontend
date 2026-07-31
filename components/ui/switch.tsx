"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

type SwitchProps = SwitchPrimitive.Root.Props & {
  tone?: "default" | "status"
}

function Switch({ className, tone = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/60 data-checked:bg-primary",
        tone === "status" &&
          "bg-destructive dark:bg-destructive data-checked:bg-success dark:data-checked:bg-success",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform data-checked:translate-x-4.5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

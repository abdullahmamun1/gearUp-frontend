"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"

import { TextField } from "./TextField"

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof TextField>,
  "type" | "icon" | "trailing"
>

/** A TextField for passwords, with a button to show or hide what's typed. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      icon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      }
    />
  )
}

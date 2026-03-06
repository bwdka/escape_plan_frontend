"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 shrink-0 rounded border-2 border-primary/20 bg-white/50 text-primary focus:ring-offset-0 focus:ring-0 accent-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, error, children, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            {label} {required && "*"}
          </label>
        )}
        {children}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
FormField.displayName = "FormField"

export { FormField }

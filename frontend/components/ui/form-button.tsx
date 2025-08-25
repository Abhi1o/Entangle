"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
}

const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-yellow-500 hover:bg-yellow-600 text-black focus:ring-yellow-500": variant === "primary",
            "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 focus:ring-gray-500":
              variant === "secondary",
            "border border-gray-600 hover:text-black text-white hover:bg-primary focus:ring-primary": variant === "outline",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
FormButton.displayName = "FormButton"

export { FormButton }

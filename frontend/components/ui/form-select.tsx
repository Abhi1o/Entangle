"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormSelectProps {
  label?: string
  required?: boolean
  error?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const FormSelect = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, FormSelectProps>(
  ({ label, required, error, placeholder, value, onValueChange, children, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {label} {required && "*"}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-full border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
          )}
          {...props}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-600 bg-gray-800 text-white shadow-md">
          <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
)
FormSelect.displayName = "FormSelect"

const FormSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-700 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
FormSelectItem.displayName = "FormSelectItem"

export { FormSelect, FormSelectItem }

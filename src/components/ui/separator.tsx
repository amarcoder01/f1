import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("shrink-0 bg-border", className)}
    {...props}
  />
))
Separator.displayName = "Separator"

const SeparatorHorizontal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px w-full bg-border", className)}
    {...props}
  />
))
SeparatorHorizontal.displayName = "SeparatorHorizontal"

const SeparatorVertical = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-full w-px bg-border", className)}
    {...props}
  />
))
SeparatorVertical.displayName = "SeparatorVertical"

export { Separator, SeparatorHorizontal, SeparatorVertical }

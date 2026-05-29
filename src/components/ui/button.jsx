import { forwardRef } from "react"
import { cn } from "../../lib/utils"

const Button = forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const variants = {
    default: "bg-accent-blue text-white hover:bg-[#3a8af7]",
    destructive: "bg-accent-red text-white hover:bg-[#f95a52]",
    outline: "border bg-transparent hover:bg-bg-elevated text-text-primary",
    secondary: "bg-bg-elevated text-text-primary hover:bg-bg-elevated/80",
    ghost: "hover:bg-bg-elevated text-text-primary",
    link: "text-accent-blue underline-offset-4 hover:underline",
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }

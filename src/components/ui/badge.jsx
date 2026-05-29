import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-bg-elevated text-text-primary",
    secondary: "bg-bg-elevated text-text-secondary",
    destructive: "bg-accent-red/10 text-accent-red",
    outline: "border text-text-secondary",
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", variants[variant], className)} {...props} />
  )
}

export { Badge }

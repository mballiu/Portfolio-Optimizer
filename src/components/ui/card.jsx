import { cn } from "../../lib/utils"

function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border bg-bg-card text-text-primary shadow-sm", className)} {...props} />
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-4 sm:p-5 pb-0", className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-sm font-semibold text-text-secondary uppercase tracking-wider border-l-2 border-accent-blue pl-3", className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-text-secondary", className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-4 sm:p-5 pt-0", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }

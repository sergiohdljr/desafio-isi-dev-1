import { cn } from "@/lib/utils"

function ClubAcronym({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-md border border-border px-1 text-caption-xs-medium", className)}>
      {children}
    </span>
  )
}

export { ClubAcronym }

import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function PenaltyBadge({ rate }: { rate: number }) {
  const variant = rate === 0 ? "success" : rate === 20 ? "destructive" : "warning"
  return (
    <Badge variant={variant} icon={rate === 0 ? <Check className="size-3" /> : undefined}>
      {rate}%
    </Badge>
  )
}

export { PenaltyBadge }

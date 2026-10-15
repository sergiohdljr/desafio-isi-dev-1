import { MID_LOYALTY_DAYS, SHORT_LOYALTY_DAYS } from "@/features/clubs/consts/penalty-rate"

function penaltyRateFor(days: number) {
  if (days <= 0) return 0
  if (days <= SHORT_LOYALTY_DAYS) return 5
  if (days <= MID_LOYALTY_DAYS) return 10
  return 20
}

export { penaltyRateFor }

const SHORT_LOYALTY_DAYS = 30
const MID_LOYALTY_DAYS = 180

function penaltyRateFor(days: number) {
  if (days <= 0) return 0
  if (days <= SHORT_LOYALTY_DAYS) return 5
  if (days <= MID_LOYALTY_DAYS) return 10
  return 20
}

export { penaltyRateFor }

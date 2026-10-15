import type { TransactionType } from "@/features/clubs/types/transactions.types"

function toggleTransactionType(current: TransactionType[], type: TransactionType, checked: boolean) {
  if (checked) return current.includes(type) ? current : [...current, type]
  return current.filter((item) => item !== type)
}

export { toggleTransactionType }

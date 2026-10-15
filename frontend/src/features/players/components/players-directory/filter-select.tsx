import type { ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function FilterSelect({
  label,
  icon,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string
  icon: ReactNode
  value: string
  options: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <Select
      value={value || null}
      onValueChange={(next) => onChange(!next || next === "all" ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto shrink-0" aria-label={label}>
        <span className="text-muted-foreground">{icon}</span>
        <SelectValue placeholder={label}>{selected ? `${label}: ${selected.label}` : null}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { FilterSelect }

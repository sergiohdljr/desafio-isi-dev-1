import { Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Club } from "@/features/clubs/types/club.types"

function ClubField({
  label,
  hint,
  value,
  clubs,
  disabled,
  invalid = false,
  onChange,
}: {
  label: string
  hint: string
  value: string
  clubs: Club[]
  disabled: boolean
  invalid?: boolean
  onChange: (value: string) => void
}) {
  const selected = clubs.find((club) => String(club.id) === value)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm-medium">{label}</span>
      <Select value={value || null} onValueChange={(next) => onChange(next ?? "")} disabled={disabled}>
        <SelectTrigger
          aria-label={label}
          aria-invalid={invalid || undefined}
          className={invalid ? "border-destructive ring-3 ring-destructive/20" : undefined}
        >
          <Shield className="size-4 text-muted-foreground" aria-hidden />
          <SelectValue placeholder="Selecione o clube">
            {selected ? `${selected.name} (${selected.acronym})` : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={String(club.id)}>
              {club.name} ({club.acronym})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-caption-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export { ClubField }

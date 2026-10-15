import { Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Club } from "@/features/clubs/types/club.types"

function ClubField({
  label,
  hint,
  value,
  clubs,
  disabled,
  onChange,
}: {
  label: string
  hint: string
  value: string
  clubs: Club[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm-medium">{label}</span>
      <Select value={value || null} onValueChange={(next) => onChange(next ?? "")} disabled={disabled}>
        <SelectTrigger aria-label={label}>
          <Shield className="size-4 text-muted-foreground" aria-hidden />
          <SelectValue placeholder="Selecione o clube" />
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

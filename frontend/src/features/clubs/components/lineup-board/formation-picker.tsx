import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FORMATIONS } from "@/features/clubs/consts/lineup"
import type { Formation } from "@/features/clubs/types/lineup.types"

function FormationPicker({
  formation,
  onChange,
}: {
  formation: Formation
  onChange: (formation: Formation) => void
}) {
  return (
    <div className="-mx-4 flex flex-col gap-2.5 border-b border-border px-5 py-4">
      <div>
        <h3 className="text-body-sm-medium">Formação</h3>
        <p className="text-caption-xs text-muted-foreground">
          Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da conta.
        </p>
      </div>
      <RadioGroup
        value={formation}
        onValueChange={(value) => {
          if (value === "3-1" || value === "2-2" || value === "2-1-1" || value === "1-2-1") {
            onChange(value)
          }
        }}
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        aria-label="Formação"
      >
        {FORMATIONS.map((item) => {
          const selected = item.value === formation
          return (
            <label
              key={item.value}
              className={
                selected
                  ? "flex gap-2 rounded-lg border-2 border-primary bg-primary-soft px-3 py-2.5"
                  : "flex gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
              }
            >
              <img src={item.diagram} alt="" width={40} height={52} />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <RadioGroupItem value={item.value} />
                  <span
                    className={
                      selected ? "text-body-sm-semibold text-primary-soft-foreground" : "text-body-sm-semibold"
                    }
                  >
                    {item.value}
                  </span>
                </span>
                <span className="block text-caption-xs text-muted-foreground">{item.note}</span>
              </span>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export { FormationPicker }

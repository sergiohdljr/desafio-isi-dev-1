import { useState, type FormEvent } from "react"
import { Info, Shield, Swords } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Club } from "@/features/clubs/types/club.types"
import { MarketDialog, PendingNote } from "@/features/players/components/market-dialog"
import { playMatch, type Match } from "@/features/league/api/league.api"

function NewMatchDialog({
  clubs,
  onClose,
  onPlayed,
}: {
  clubs: Club[]
  onClose: () => void
  onPlayed: (match: Match) => void
}) {
  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!homeId || !awayId || homeId === awayId) {
      setFailure("Escolha dois clubes diferentes.")
      return
    }
    setFailure(null)
    setPending(true)
    try {
      const match = await playMatch(Number(homeId), Number(awayId))
      onPlayed(match)
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Não foi possível jogar a partida.")
      setPending(false)
    }
  }

  const refused = failure !== null && !(failure === "Escolha dois clubes diferentes.")
  const incomplete = failure !== null && failure.toLowerCase().includes("escal")

  return (
    <MarketDialog
      title="Nova partida"
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {failure && (refused || incomplete) ? (
          <Alert variant="destructive" title={incomplete ? "Escalação incompleta" : "Partida recusada"} description={failure} />
        ) : null}
        <ClubField
          label="Mandante"
          hint="Faz os 3 primeiros ataques."
          value={homeId}
          clubs={clubs}
          disabled={pending}
          onChange={setHomeId}
        />
        <ClubField
          label="Visitante"
          hint="Precisa ser um clube diferente do mandante."
          value={awayId}
          clubs={clubs}
          disabled={pending}
          onChange={setAwayId}
        />
        {failure === "Escolha dois clubes diferentes." ? <p className="text-caption-xs text-destructive">{failure}</p> : null}
        <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted-subtle px-3.5 py-3 text-caption-xs text-muted-foreground">
          <p className="flex items-center gap-2 text-body-sm-medium text-foreground">
            <Info className="size-4" aria-hidden />
            Como sai o placar
          </p>
          <p>
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal condicionado joga com 15% a menos.
          </p>
          <p>Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
        </div>
        {pending ? <PendingNote>Jogando a partida. Os botões ficam desabilitados.</PendingNote> : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={pending}>
            <Swords />
            {pending ? "Jogando…" : "Jogar partida"}
          </Button>
        </div>
      </form>
    </MarketDialog>
  )
}

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

export { NewMatchDialog }

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, CircleCheck, TriangleAlert } from "lucide-react"
import { getLineup, saveLineup, type Formation } from "@/features/clubs/api/clubs.api"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Condition, Player, Position } from "@/features/players/types/player.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FORMATIONS: { value: Formation; defense: string; attack: string }[] = [
  { value: "3-1", defense: "Defesa 3, ataque 1", attack: "" },
  { value: "2-2", defense: "Defesa 2, ataque 2", attack: "" },
  { value: "2-1-1", defense: "Defesa 2, meio 1,", attack: "ataque 1" },
  { value: "1-2-1", defense: "Defesa 1, meio 2,", attack: "ataque 1" },
]

type SlotKind = "GOL" | "DEF" | "MEI" | "ATA"

const SLOTS: Record<Formation, { kind: SlotKind; label: string; hint: string }[]> = {
  "3-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-2": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-1-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "1-2-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
}

const PITCH: Record<Formation, { top: string; left: string }[]> = {
  "3-1": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "18%" },
    { top: "52%", left: "50%" },
    { top: "52%", left: "82%" },
    { top: "16%", left: "50%" },
  ],
  "2-2": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "30%" },
    { top: "52%", left: "70%" },
    { top: "18%", left: "30%" },
    { top: "18%", left: "70%" },
  ],
  "2-1-1": [
    { top: "78%", left: "50%" },
    { top: "54%", left: "28%" },
    { top: "54%", left: "72%" },
    { top: "34%", left: "50%" },
    { top: "14%", left: "50%" },
  ],
  "1-2-1": [
    { top: "78%", left: "50%" },
    { top: "56%", left: "50%" },
    { top: "36%", left: "28%" },
    { top: "36%", left: "72%" },
    { top: "14%", left: "50%" },
  ],
}

const STARTER_COUNT = 5
const DEFAULT_FORMATION: Formation = "2-1-1"

function LineupBoard({ clubId, squad }: { clubId: number; squad: SquadPlayer[] }) {
  const lineup = useQuery({
    queryKey: ["clubs", "lineup", clubId],
    queryFn: () => getLineup(clubId),
  })
  const [formation, setFormation] = useState<Formation>(DEFAULT_FORMATION)
  const [starters, setStarters] = useState<(number | null)[]>(emptyStarters())
  const [saved, setSaved] = useState<{ formation: Formation; starters: (number | null)[] } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lineup.data) return
    const nextFormation = lineup.data.formation ?? DEFAULT_FORMATION
    const nextStarters = placeStarters(nextFormation, lineup.data.players)
    setFormation(nextFormation)
    setStarters(nextStarters)
    setSaved({ formation: nextFormation, starters: nextStarters })
  }, [lineup.data])

  const chosen = starters.map((id) => squad.find((player) => player.id === id) ?? null)
  const unfit = chosen.filter((player) => player?.condition === "MAL_CONDICIONADO")
  const complete = chosen.every((player) => player !== null)
  const reserves = squad.filter((player) => !starters.includes(player.id))

  function chooseFormation(next: Formation) {
    setFormation(next)
    setStarters((current) =>
      SLOTS[next].map((slot, index) => {
        const player = squad.find((item) => item.id === current[index])
        return player && fits(slot.kind, player.position) ? player.id : null
      }),
    )
  }

  async function save() {
    if (!complete) return
    setPending(true)
    setError(null)
    try {
      const stored = await saveLineup(
        clubId,
        formation,
        chosen.map((player) => player!.id),
      )
      const nextStarters = placeStarters(formation, stored.players)
      setSaved({ formation, starters: nextStarters })
      setStarters(nextStarters)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar a escalação.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex flex-col gap-4 rounded-[12px] border border-border bg-card p-4 shadow-xs">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-body-sm-semibold">Titulares</h2>
            <p className="text-caption-xs text-muted-foreground">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
            </p>
          </div>
          {complete ? (
            <Badge variant="success" icon={<CircleCheck className="size-3" />}>
              Completa
            </Badge>
          ) : null}
        </header>
        <div>
          <h3 className="text-body-sm-medium">Formação</h3>
          <p className="text-caption-xs text-muted-foreground">
            Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da conta.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {FORMATIONS.map((item) => {
              const selected = item.value === formation
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseFormation(item.value)}
                  className={
                    selected
                      ? "flex items-center gap-2 rounded-lg border border-primary bg-primary-soft px-3 py-2 text-left"
                      : "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left"
                  }
                >
                  <span className={selected ? "size-4 rounded-full border border-primary bg-primary shadow-[inset_0_0_0_3px_white]" : "size-4 rounded-full border border-input"} />
                  <span>
                    <span className="block text-body-sm-medium">{item.value}</span>
                    <span className="block text-caption-xs text-muted-foreground">
                      {item.defense} {item.attack}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
              <tr className="h-10 bg-muted-subtle">
                <th className="pr-2 pl-4 font-medium">Vaga</th>
                <th className="px-2 font-medium">Titular</th>
                <th className="w-[160px] px-2 font-medium">Condição</th>
                <th className="w-[80px] px-2 font-medium">Overall</th>
                <th className="pr-4 pl-2 font-medium">Atributos usados</th>
              </tr>
            </thead>
            <tbody>
              {SLOTS[formation].map((slot, index) => {
                const player = chosen[index]
                const options = squad.filter(
                  (item) =>
                    fits(slot.kind, item.position) &&
                    item.condition !== "DOENTE" &&
                    (item.id === player?.id || !starters.includes(item.id)),
                )
                return (
                  <tr key={`${slot.kind}-${index}`} className="h-[60px] border-b border-border last:border-b-0">
                    <td className="pr-2 pl-4">
                      <span className="block text-body-sm-medium">{slot.label}</span>
                      <span className="block text-caption-xs text-muted-foreground">{slot.hint}</span>
                    </td>
                    <td className="px-2">
                      <Select
                        value={player ? String(player.id) : null}
                        onValueChange={(value) => {
                          if (!value) return
                          setStarters((current) =>
                            current.map((id, slotIndex) => (slotIndex === index ? Number(value) : id)),
                          )
                        }}
                      >
                        <SelectTrigger className="w-[220px]" aria-label={slot.label}>
                          <SelectValue placeholder="Escolher">{player ? `${player.name} (${player.position})` : "Escolher"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                              {option.name} ({option.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2">
                      {player ? (
                        <Badge variant={conditionVariant(player.condition)} dot>
                          {conditionLabel(player.condition)}
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-2 text-body-sm-semibold tabular-nums">{player?.overall ?? ""}</td>
                    <td className="pr-4 pl-2 text-body-sm text-muted-foreground">{player ? usedAttributes(player) : ""}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {unfit.length > 0 ? (
          <p className="flex items-start gap-2 rounded-lg border border-warning-soft-border bg-warning-soft px-4 py-3 text-body-sm text-warning-soft-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="block font-medium">{unfit.map((player) => player!.name).join(" e ")} {unfit.length === 1 ? "está" : "estão"} mal condicionados</span>
              Podem jogar, mas cada atributo vale 15% a menos durante a partida.
            </span>
          </p>
        ) : null}
        {error ? <p className="text-caption-xs text-destructive">{error}</p> : null}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="max-w-[420px] text-caption-xs text-muted-foreground">
            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!saved}
              onClick={() => {
                if (!saved) return
                setFormation(saved.formation)
                setStarters(saved.starters)
                setError(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={!complete || pending} onClick={() => void save()}>
              <Check />
              Salvar escalação
            </Button>
          </div>
        </footer>
      </section>
      <div className="flex flex-col gap-4">
        <section className="rounded-[12px] border border-border bg-card p-4 shadow-xs">
          <h2 className="text-body-sm-semibold">Em campo</h2>
          <p className="text-caption-xs text-muted-foreground">Prévia da formação {formation}, do goleiro ao ataque.</p>
          <div className="relative mt-3 h-[280px] overflow-hidden rounded-xl bg-[#157347]">
            <span className="absolute inset-x-8 top-1/2 h-px bg-white/40" />
            <span className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
            {chosen.map((player, index) =>
              player ? (
                <span
                  key={player.id}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ top: PITCH[formation][index].top, left: PITCH[formation][index].left }}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-caption-xs-medium text-primary-foreground">
                    {initials(player.name)}
                  </span>
                  <span className="mt-1 rounded bg-black/60 px-1 text-caption-xs text-white">{lastName(player.name)}</span>
                </span>
              ) : null,
            )}
          </div>
          <p className="mt-3 text-caption-xs text-muted-foreground">
            Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados. É gol quando o ataque é maior que a defesa.
          </p>
        </section>
        <section className="rounded-[12px] border border-border bg-card p-4 shadow-xs">
          <h2 className="text-body-sm-semibold">Reservas</h2>
          <p className="mb-3 text-caption-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
          <ul className="flex flex-col gap-2">
            {reserves.map((player) => (
              <li key={player.id} className="flex items-center justify-between gap-2">
                <span>
                  <span className="block text-body-sm-medium">{player.name}</span>
                  <span className="block text-caption-xs text-muted-foreground">{positionLabel(player.position)}</span>
                </span>
                <Badge variant={conditionVariant(player.condition)} dot>
                  {conditionLabel(player.condition)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption-xs text-muted-foreground">Doente não pode ser escalado.</p>
        </section>
      </div>
    </div>
  )
}

function emptyStarters() {
  return Array.from({ length: STARTER_COUNT }, () => null)
}

function placeStarters(formation: Formation, players: Player[]) {
  const remaining = [...players]
  return SLOTS[formation].map((slot) => {
    const index = remaining.findIndex((player) => fits(slot.kind, player.position))
    if (index < 0) return null
    const [player] = remaining.splice(index, 1)
    return player.id
  })
}

function fits(kind: SlotKind, position: Position) {
  if (kind === "DEF") return position === "ZAG" || position === "LAT"
  return position === kind
}

function usedAttributes(player: SquadPlayer) {
  if (player.position === "ATA") return `Finalização ${player.shooting}`
  if (player.position === "MEI") return `Passe ${player.passing}`
  if (player.position === "LAT") return `Drible ${player.dribbling} Defesa ${player.defending}`
  return `Defesa ${player.defending}`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return `${first}${last}`.toLocaleUpperCase("pt-BR")
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? name
}

function positionLabel(position: Position) {
  if (position === "GOL") return "Goleiro"
  if (position === "ZAG") return "Zagueiro"
  if (position === "LAT") return "Lateral"
  if (position === "MEI") return "Meio-campo"
  return "Atacante"
}

function conditionLabel(condition: Condition) {
  if (condition === "APTO") return "Apto"
  if (condition === "MAL_CONDICIONADO") return "Mal condicionado"
  return "Doente"
}

function conditionVariant(condition: Condition) {
  if (condition === "APTO") return "success" as const
  if (condition === "MAL_CONDICIONADO") return "warning" as const
  return "destructive" as const
}

export { LineupBoard }

import { HeartPulse, Plus, Swords } from "lucide-react"
import { PITCH, SLOTS } from "@/features/clubs/consts/lineup"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Formation } from "@/features/clubs/types/lineup.types"
import { lastName } from "@/features/clubs/utils/last-name"
import { initials } from "@/features/players/utils/player-display"

function LineupPitch({
  formation,
  chosen,
  complete,
  savedFormation,
}: {
  formation: Formation
  chosen: (SquadPlayer | null)[]
  complete: boolean
  savedFormation: Formation | null
}) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-heading-card">Em campo</h2>
        <p className="text-caption-xs text-muted-foreground">
          {savedFormation && !complete
            ? `Prévia da formação ${savedFormation} salva; a vaga vazia fica tracejada.`
            : `Prévia da formação ${formation}, do goleiro ao ataque.`}
        </p>
      </header>
      <div className="p-4">
        <div className="relative h-[360px] overflow-hidden rounded-[10px] bg-pitch" aria-hidden>
          <span className="absolute inset-x-0 top-10 h-10 bg-pitch-stripe" />
          <span className="absolute inset-x-0 top-[120px] h-10 bg-pitch-stripe" />
          <span className="absolute inset-x-0 top-[200px] h-10 bg-pitch-stripe" />
          <span className="absolute inset-x-0 top-[280px] h-10 bg-pitch-stripe" />
          <svg
            className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
            viewBox="0 0 260 336"
            fill="none"
          >
            <rect x="1" y="1" width="258" height="334" stroke="white" strokeOpacity="0.75" />
            <line x1="1" y1="168" x2="259" y2="168" stroke="white" strokeOpacity="0.75" />
            <circle cx="130" cy="168" r="28" stroke="white" strokeOpacity="0.75" />
            <rect x="70" y="250" width="120" height="85" stroke="white" strokeOpacity="0.75" />
            <rect x="100" y="308" width="60" height="27" stroke="white" strokeOpacity="0.75" />
          </svg>
          {SLOTS[formation].map((slot, index) => {
            const player = chosen[index]
            return (
              <span
                key={`${slot.kind}-${index}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                style={{ top: PITCH[formation][index].top, left: PITCH[formation][index].left }}
              >
                {player ? (
                  <span className="relative inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-caption-xs-medium text-primary-foreground shadow-md">
                    {initials(player.name)}
                    {player.condition === "MAL_CONDICIONADO" ? (
                      <span className="absolute -top-1.5 -left-1.5 inline-flex size-4 items-center justify-center rounded-full border-[1.5px] border-background bg-warning text-white">
                        <HeartPulse className="size-2.5" />
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="inline-flex size-8 items-center justify-center rounded-full border-[1.5px] border-dashed border-pitch-line text-pitch-line">
                    <Plus className="size-3.5" />
                  </span>
                )}
                <span
                  className={
                    player
                      ? "rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium text-pitch-foreground"
                      : "rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium text-pitch-muted-foreground"
                  }
                >
                  {player ? lastName(player.name) : slot.label}
                </span>
              </span>
            )
          })}
        </div>
      </div>
      <footer className="flex items-start gap-2 border-t border-border bg-muted-subtle px-4 py-3">
        <Swords className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-caption-xs text-muted-foreground">
          Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados. É gol
          quando o ataque é maior que a defesa.
        </p>
      </footer>
    </section>
  )
}

export { LineupPitch }

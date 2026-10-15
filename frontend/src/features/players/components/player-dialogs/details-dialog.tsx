import { ChartColumn, Coins, HeartPulse, Pencil, ShoppingCart, TrendingUp, Wallet } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogClose, coins } from "@/features/players/components/market-dialog"
import { DetailStat } from "@/features/players/components/player-dialogs/detail-stat"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import { SKILLS } from "@/features/players/consts/skills"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"
import type { Player } from "@/features/players/types/player.types"
import { attributeFill } from "@/features/players/utils/attribute-fill"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { conditionLabel, initials } from "@/features/players/utils/player-display"

function DetailsDialog({
  player,
  clubName,
  onClose,
  onEdit,
  onCondition,
  onBuy,
}: {
  player: Player
  clubName?: string
  onClose: () => void
  onEdit: () => void
  onCondition: () => void
  onBuy?: () => void
}) {
  const { ref, titleId } = useModalDialog()
  const skills = SKILLS.map((skill) => ({ label: skill.label, value: player[skill.key] }))

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-120 overflow-y-auto border-y-0 border-r-0 bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4.5"
    >
      <DialogClose onClose={onClose} />
      <header className="flex items-center gap-3.5 pr-8">
        <Avatar initials={initials(player.name)} size="lg" className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={titleId} className="text-heading-dialog">
            {player.name}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{player.position}</Badge>
            <Badge variant={conditionVariant(player.condition)} dot>
              {conditionLabel(player.condition)}
            </Badge>
            {player.club_id === null ? <Badge variant="secondary">Livre</Badge> : null}
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <DetailStat
          icon={<Coins className="size-3.5" />}
          label="Valor de mercado"
          value={coins.format(player.market_value)}
          hint="Calculado automaticamente"
        />
        <DetailStat
          icon={<Wallet className="size-3.5" />}
          label="Valor base"
          value={coins.format(player.base_value)}
          hint="Calculado no cadastro"
        />
        <DetailStat
          icon={<ChartColumn className="size-3.5" />}
          label="Overall"
          value={String(player.overall)}
          hint="Calculado pela posição"
        />
        <DetailStat
          icon={<TrendingUp className="size-3.5" />}
          label="Potencial"
          value={String(player.potential)}
          hint="Informado no cadastro"
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-card">Indicadores técnicos</h3>
          <p className="text-caption-xs text-muted-foreground">Escala de 1 a 99</p>
        </div>
        {skills.map((skill) => (
          <div key={skill.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-body-sm text-muted-foreground">{skill.label}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
                style={{ width: `${attributeFill(player.potential)}%` }}
              />
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${attributeFill(skill.value)}%` }}
              />
            </span>
            <span className="w-7 text-right text-body-sm-medium tabular-nums">{skill.value}</span>
          </div>
        ))}
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-xs bg-primary" /> Valor do atributo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-xs bg-chart-2" /> Até o potencial ({player.potential}), que nenhum
            atributo passa
          </span>
        </p>
      </div>
      <dl className="rounded-lg border border-border text-body-sm">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <dt className="text-muted-foreground">Idade</dt>
          <dd className="text-body-sm-medium">{player.age} anos</dd>
        </div>
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <dt className="text-muted-foreground">Agilidade</dt>
          <dd className="text-body-sm-medium">{player.agility}</dd>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <dt className="text-muted-foreground">Clube</dt>
          <dd className="text-body-sm-medium">{clubName ?? "Livre"}</dd>
        </div>
      </dl>
      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onEdit}>
            <Pencil /> Editar
          </Button>
          <Button type="button" variant="outline" onClick={onCondition}>
            <HeartPulse /> Alterar condição
          </Button>
          {onBuy ? (
            <Button type="button" className="ml-auto" onClick={onBuy}>
              <ShoppingCart /> Comprar
            </Button>
          ) : null}
        </div>
      </div>
    </dialog>
  )
}

export { DetailsDialog }

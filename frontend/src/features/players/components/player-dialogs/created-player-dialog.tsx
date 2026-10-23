import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketDialog, SuccessMark, SummaryRow, coins } from "@/features/players/components/market-dialog"
import type { Player } from "@/features/players/types/player.types"
import { positionLabel } from "@/features/players/utils/player-display"

function CreatedPlayerDialog({
  player,
  onClose,
  onDetails,
}: {
  player: Player
  onClose: () => void
  onDetails: () => void
}) {
  return (
    <MarketDialog
      title="Jogador cadastrado"
      description={`${player.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
      onClose={onClose}
      leading={<SuccessMark />}
    >
      <dl className="overflow-hidden rounded-[10px] border border-border">
        <SummaryRow
          label="Valor base"
          hint="Calculado no cadastro; não muda depois"
          value={coins.format(player.base_value)}
          emphasis
        />
        <SummaryRow
          label="Valor de mercado"
          hint="Com condição, agilidade e idade"
          value={coins.format(player.market_value)}
        />
        <SummaryRow
          label="Overall"
          hint={`Pelos pesos da posição ${positionLabel(player.position)}`}
          value={String(player.overall)}
          last
        />
      </dl>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onDetails}>
          <Eye /> Ver detalhes
        </Button>
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </MarketDialog>
  )
}

export { CreatedPlayerDialog }

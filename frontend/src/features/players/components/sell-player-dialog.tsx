import { useState, type FormEvent } from "react"
import { HandCoins, History } from "lucide-react"
import { ApiError } from "@/lib/http"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { penaltyRateFor } from "@/features/clubs/utils/penalty-rate"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { sellPlayer } from "@/features/players/api/players.api"
import type { Sale } from "@/features/players/types/market.types"
import {
  MarketDialog,
  PendingNote,
  PlayerMarketCard,
  RulesNote,
  SuccessMark,
  SummaryRow,
  coins,
  formatLoyalty,
  signedCoins,
} from "@/features/players/components/market-dialog"

function SellPlayerDialog({
  player,
  clubName,
  starter,
  onClose,
  onSold,
  onViewHistory,
}: {
  player: SquadPlayer
  clubName: string
  starter: boolean
  onClose: () => void
  onSold: () => Promise<unknown>
  onViewHistory: () => void
}) {
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<"network" | "refused" | null>(null)
  const [failureMessage, setFailureMessage] = useState("")
  const [sale, setSale] = useState<Sale | null>(null)
  const rate = penaltyRateFor(player.contract.remaining_days)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFailure(null)
    setPending(true)
    try {
      const result = await sellPlayer(player.id)
      await onSold()
      setSale(result)
    } catch (error) {
      const offline = error instanceof ApiError && error.status === 0
      setFailure(offline ? "network" : "refused")
      setFailureMessage(error instanceof Error ? error.message : "Não foi possível vender o jogador.")
      setPending(false)
    }
  }

  if (sale) {
    const leftLineup = starter
    return (
      <MarketDialog
        title="Venda concluída"
        description={
          leftLineup
            ? `${player.name} voltou a ficar livre e saiu da escalação.`
            : `${player.name} voltou a ficar livre.`
        }
        onClose={onClose}
        leading={<SuccessMark />}
      >
        <dl className="overflow-hidden rounded-[10px] border border-border text-body-sm">
          <SummaryRow label="Valor de compra" value={coins.format(sale.purchase_value)} />
          <SummaryRow
            label="Valor de venda"
            hint="Valor de mercado no momento da venda"
            value={coins.format(sale.value)}
          />
          <SummaryRow label="Dias restantes" value={String(sale.remaining_days)} />
          <SummaryRow
            label="Multa"
            hint={
              sale.penalty > 0
                ? `${sale.penalty_rate}% do valor de venda, com teto de 10,00`
                : "Fidelidade cumprida: sem multa"
            }
            value={coins.format(sale.penalty)}
          />
          <SummaryRow
            label="Lucro"
            value={signedCoins(sale.profit)}
            valueClassName={sale.profit > 0 ? "text-success" : sale.profit < 0 ? "text-destructive" : undefined}
          />
          <SummaryRow
            label="Comissão"
            hint={sale.fee > 0 ? "10% do lucro até 10,00 + 20% do que passar" : "Sem lucro: sem comissão"}
            value={coins.format(sale.fee)}
          />
          <SummaryRow
            label="Crédito no caixa"
            hint="Valor de venda − multa − comissão"
            value={signedCoins(sale.cash_change)}
            emphasis
          />
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <dt className="text-muted-foreground">Contrato</dt>
            <dd>
              <Badge variant={sale.contract_status === "RESCINDIDO" ? "warning" : "success"} dot>
                {sale.contract_status}
              </Badge>
            </dd>
          </div>
          <SummaryRow label={`Novo caixa do ${clubName}`} value={coins.format(sale.club_cash)} emphasis last />
        </dl>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onViewHistory}>
            <History /> Ver histórico
          </Button>
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </MarketDialog>
    )
  }

  return (
    <MarketDialog
      title={`Vender ${player.name}?`}
      description={`O jogador sai do elenco do ${clubName} e volta a ficar livre.`}
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {failure === "network" ? (
          <Alert variant="destructive" title="Sem conexão" description={failureMessage} />
        ) : null}
        {failure === "refused" ? (
          <Alert variant="destructive" title="Venda recusada" description={failureMessage} />
        ) : null}
        {starter ? (
          <Alert
            variant="warning"
            title={`${player.name} é titular`}
            description={`Ao vender, ele sai da escalação, e o ${clubName} só volta a jogar partidas depois de escalar de novo os 5 titulares.`}
          />
        ) : null}
        <PlayerMarketCard player={player} />
        <dl className="overflow-hidden rounded-[10px] border border-border text-body-sm">
          <SummaryRow label="Valor de compra" value={coins.format(player.contract.purchase_value)} />
          <SummaryRow label="Fim da fidelidade" value={formatLoyalty(player.contract.loyalty_until)} />
          <SummaryRow label="Dias restantes" value={String(player.contract.remaining_days)} />
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <dt className="text-muted-foreground">% de multa se vender agora</dt>
            <dd>
              <Badge variant={rate === 0 ? "success" : rate === 20 ? "destructive" : "warning"}>{rate}%</Badge>
            </dd>
          </div>
        </dl>
        <RulesNote>
          A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e crédito são calculados ao
          confirmar.
        </RulesNote>
        {pending ? <PendingNote>Enviando a venda. Os botões ficam desabilitados até a resposta.</PendingNote> : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            <HandCoins />
            {pending ? "Vendendo…" : failure === "network" ? "Tentar de novo" : "Confirmar venda"}
          </Button>
        </div>
      </form>
    </MarketDialog>
  )
}

export { SellPlayerDialog }

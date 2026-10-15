import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Calendar, Clock, Shield, ShoppingCart } from "lucide-react"
import { paths } from "@/app/routes"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Club } from "@/features/clubs/types/club.types"
import {
  MarketDialog,
  PendingNote,
  PlayerMarketCard,
  RulesNote,
  SuccessMark,
  SummaryRow,
  coins,
  formatLoyalty,
} from "@/features/players/components/market-dialog"
import { FEE_RATE, FEE_THRESHOLD } from "@/features/players/consts/market-fees"
import type { Purchase } from "@/features/players/types/market.types"
import type { Player } from "@/features/players/types/player.types"
import { clubOption } from "@/features/players/utils/club-option"
import { ApiError } from "@/lib/http"

function BuyPlayerDialog({
  player,
  clubs,
  onClose,
  onSubmit,
}: {
  player: Player
  clubs: Club[]
  onClose: () => void
  onSubmit: (clubId: number, loyaltyUntil: string) => Promise<Purchase>
}) {
  const navigate = useNavigate()
  const [clubId, setClubId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [failure, setFailure] = useState<"network" | "refused" | null>(null)
  const [failureMessage, setFailureMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const club = clubs.find((item) => String(item.id) === clubId)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!clubId || !date || !time) {
      setFieldError("Escolha o clube, a data e a hora da fidelidade.")
      return
    }
    setFieldError(null)
    setFailure(null)
    setPending(true)
    try {
      const result = await onSubmit(Number(clubId), `${date}T${time}-03:00`)
      setPurchase(result)
    } catch (error) {
      const offline = error instanceof ApiError && error.status === 0
      setFailure(offline ? "network" : "refused")
      setFailureMessage(error instanceof Error ? error.message : "Não foi possível comprar o jogador.")
      setPending(false)
    }
  }

  if (purchase && club) {
    return (
      <MarketDialog
        title="Compra concluída"
        description={`${player.name} agora é do ${club.name}.`}
        onClose={onClose}
        leading={<SuccessMark />}
      >
        <dl className="overflow-hidden rounded-[10px] border border-border text-body-sm">
          <SummaryRow label="Valor" hint="Valor de mercado no momento da compra" value={coins.format(purchase.value)} />
          <SummaryRow
            label="Taxa"
            hint={purchase.fee > 0 ? "5% do valor, porque passa de 30,00" : "Sem taxa, porque o valor não passa de 30,00"}
            value={coins.format(purchase.fee)}
          />
          <SummaryRow
            label="Custo total"
            hint="Valor + taxa"
            value={coins.format(purchase.value + purchase.fee)}
            emphasis
          />
          <SummaryRow label="Fim da fidelidade" value={formatLoyalty(purchase.contract.loyalty_until)} />
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <dt className="text-muted-foreground">Contrato</dt>
            <dd>
              <Badge variant="success" dot>
                ATIVO
              </Badge>
            </dd>
          </div>
          <SummaryRow label={`Novo caixa do ${club.name}`} value={coins.format(purchase.club_cash)} emphasis last />
        </dl>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(paths.club(club.id))}>
            Ver clube <ArrowRight />
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
      wide
      title="Comprar jogador"
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {failure === "network" ? (
          <Alert variant="destructive" title="Sem conexão" description={failureMessage} />
        ) : null}
        {failure === "refused" ? (
          <Alert variant="destructive" title="Compra recusada" description={failureMessage} />
        ) : null}
        <PlayerMarketCard player={player} />
        <div className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Clube comprador</span>
          <Select
            value={clubId || null}
            onValueChange={(value) => setClubId(value ?? "")}
            items={clubs.map((item) => ({ value: String(item.id), label: clubOption(item) }))}
            disabled={pending}
          >
            <SelectTrigger>
              <Shield className="size-4 text-muted-foreground" aria-hidden />
              <SelectValue placeholder={clubs.length === 0 ? "Nenhum clube disponível" : "Selecione o clube"} />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {clubOption(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-caption-xs text-muted-foreground">
            {club
              ? `Caixa atual: ${coins.format(club.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
              : "O custo total (valor + taxa) pode ir até 50% do caixa."}
          </p>
          {fieldError ? <p className="text-caption-xs text-destructive">{fieldError}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Fim da fidelidade</span>
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <Calendar
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="date"
                className="pl-9"
                value={date}
                disabled={pending}
                aria-label="Data da fidelidade"
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="relative w-32 shrink-0">
              <Clock
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="time"
                className="pl-9"
                value={time}
                disabled={pending}
                aria-label="Hora da fidelidade"
                onChange={(event) => setTime(event.target.value)}
              />
            </label>
          </div>
          <p className="text-caption-xs text-muted-foreground">
            Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).
          </p>
        </div>
        <RulesNote>
          {`A taxa é de ${FEE_RATE * 100}% do valor de mercado, só quando ele passa de ${coins.format(FEE_THRESHOLD)}. Taxa, custo e novo caixa são calculados ao confirmar.`}
        </RulesNote>
        {pending ? <PendingNote>Enviando a compra. Os botões ficam desabilitados.</PendingNote> : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            <ShoppingCart />
            {pending ? "Comprando…" : failure === "network" ? "Tentar de novo" : "Confirmar compra"}
          </Button>
        </div>
      </form>
    </MarketDialog>
  )
}

export { BuyPlayerDialog }

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BadgePercent, Download, HandCoins, History, ShoppingCart, TriangleAlert, TrendingUp } from "lucide-react"
import { exportClubTransactions, listClubTransactions } from "@/features/clubs/api/clubs.api"
import type { TransactionType } from "@/features/clubs/types/transactions.types"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import { initials } from "@/features/players/utils/player-display"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toast, ToastViewport } from "@/components/ui/toast"

const money = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const TOTALS = [
  { key: "total_spent", label: "Total pago em compras", hint: "Valor + taxa", icon: ShoppingCart },
  { key: "total_received", label: "Total recebido em vendas", hint: "Crédito líquido", icon: HandCoins },
  { key: "total_fees", label: "Taxas e comissões", hint: "Somadas", icon: BadgePercent },
  { key: "total_penalties", label: "Multas", hint: "Por fidelidade", icon: TriangleAlert },
  { key: "total_profit", label: "Lucro total", hint: "Soma dos lucros, com sinal", icon: TrendingUp },
] as const

function ClubHistory({ clubId, players }: { clubId: number; players: SquadPlayer[] }) {
  const [types, setTypes] = useState<TransactionType[]>(["COMPRA", "VENDA"])
  const [playerId, setPlayerId] = useState<string>("")
  const [exportError, setExportError] = useState<string | null>(null)
  const [exported, setExported] = useState(false)
  const [exporting, setExporting] = useState(false)
  const filtered = types.length > 0
  const history = useQuery({
    queryKey: ["clubs", "transactions", clubId, types.join(","), playerId],
    queryFn: () =>
      listClubTransactions(clubId, {
        types,
        playerId: playerId ? Number(playerId) : undefined,
      }),
    enabled: filtered,
  })
  const rows = history.data?.data ?? []
  const summary = history.data?.summary
  const error = history.error instanceof Error ? history.error.message : history.error ? "Não foi possível carregar o histórico." : null
  const filtersChanged = types.length !== 2 || playerId !== ""

  function toggleType(type: TransactionType, checked: boolean) {
    setTypes((current) => {
      if (checked) return current.includes(type) ? current : [...current, type]
      return current.filter((item) => item !== type)
    })
  }

  async function download() {
    setExportError(null)
    setExporting(true)
    try {
      const file = await exportClubTransactions(clubId, {
        types,
        playerId: playerId ? Number(playerId) : undefined,
      })
      const url = URL.createObjectURL(file)
      const link = document.createElement("a")
      link.href = url
      link.download = "historico.csv"
      link.click()
      URL.revokeObjectURL(url)
      setExported(true)
    } catch (caught) {
      setExportError(caught instanceof Error ? caught.message : "Não foi possível exportar o histórico.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
        <header className="flex items-center gap-4 border-b border-border px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-heading-card">Histórico de transações</h2>
            <p className="text-caption-xs text-muted-foreground">Da mais recente para a mais antiga, com o nome gravado na transação.</p>
          </div>
          <Button type="button" variant="outline" disabled={!filtered || exporting} onClick={() => void download()}>
            <Download />
            Exportar CSV
          </Button>
        </header>
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
          <span className="text-body-sm-medium">Tipo</span>
          <TypeFilter label="Compra" checked={types.includes("COMPRA")} onChange={(checked) => toggleType("COMPRA", checked)} />
          <TypeFilter label="Venda" checked={types.includes("VENDA")} onChange={(checked) => toggleType("VENDA", checked)} />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Select value={playerId || null} onValueChange={(value) => setPlayerId(value && value !== "all" ? value : "")}>
            <SelectTrigger className="w-auto" aria-label="Filtrar por jogador">
              <SelectValue placeholder="Todos os jogadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os jogadores</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={String(player.id)}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersChanged ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypes(["COMPRA", "VENDA"])
                setPlayerId("")
              }}
            >
              Limpar filtros
            </Button>
          ) : null}
        </div>
        {error ? (
          <div className="px-4 py-3">
            <Alert variant="destructive" title="Filtro recusado" description={error} />
          </div>
        ) : null}
        {!error && rows.length === 0 && !history.isPending ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <History className="size-6" aria-hidden />
            </span>
            <p className="text-heading-card">Nenhuma transação ainda</p>
            <p className="max-w-md text-body-sm text-muted-foreground">
              As compras e vendas do clube aparecem aqui, com valor, taxa, multa e a variação do caixa.
            </p>
          </div>
        ) : null}
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
                <tr className="h-10 bg-muted-subtle">
                  <th className="pr-2 pl-4 font-medium">Data e hora</th>
                  <th className="px-2 font-medium">Tipo</th>
                  <th className="px-2 font-medium">Jogador</th>
                  <th className="px-2 text-right font-medium">Valor</th>
                  <th className="px-2 text-right font-medium">Taxa ou comissão</th>
                  <th className="px-2 text-right font-medium">Multa</th>
                  <th className="px-2 text-right font-medium">Lucro</th>
                  <th className="pr-4 pl-2 text-right font-medium">Variação do caixa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const when = splitWhen(row.created_at)
                  return (
                    <tr key={row.id} className="h-[52px] border-b border-border last:border-b-0">
                      <td className="pr-2 pl-4 text-body-sm tabular-nums">
                        {when.date} <span className="text-muted-foreground">{when.time}</span>
                      </td>
                      <td className="px-2">
                        <Badge variant={row.type === "COMPRA" ? "default" : "warning"}>{row.type === "COMPRA" ? "Compra" : "Venda"}</Badge>
                      </td>
                      <td className="px-2">
                        <span className="flex items-center gap-2.5">
                          <Avatar initials={initials(row.player_name)} className={AVATAR_TONES[row.player_id % AVATAR_TONES.length]} />
                          <span className="text-body-sm-medium">{row.player_name}</span>
                        </span>
                      </td>
                      <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.value)}</td>
                      <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.fee)}</td>
                      <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.penalty)}</td>
                      <td className="px-2 text-right text-body-sm tabular-nums">{row.type === "COMPRA" ? "–" : signed(row.profit)}</td>
                      <td className="pr-4 pl-2 text-right text-body-sm tabular-nums">{signed(row.cash_change)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {summary && !error ? (
          <div className="grid grid-cols-5 border-t border-border">
            {TOTALS.map((item) => {
              const Icon = item.icon
              const value = summary[item.key]
              return (
                <div key={item.key} className="flex flex-col gap-1 border-r border-border px-4 py-3.5 last:border-r-0">
                  <p className="flex items-center gap-1.5 text-caption-xs text-muted-foreground">
                    <Icon className="size-3.5" aria-hidden />
                    {item.label}
                  </p>
                  <p className="text-heading-card tabular-nums">{item.key === "total_profit" ? signed(value) : money.format(value)}</p>
                  <p className="text-caption-xs text-muted-foreground">{item.hint}</p>
                </div>
              )
            })}
          </div>
        ) : null}
      </section>
      <p className="text-caption-xs text-muted-foreground">
        Na compra, o lucro aparece como traço. A variação do caixa sai negativa na compra e positiva na venda.
      </p>
      {exportError ? <Alert variant="destructive" title="Exportação recusada" description={exportError} /> : null}
      {exported ? (
        <ToastViewport>
          <Toast variant="success" title="CSV baixado" description="O arquivo usa o mesmo filtro da tabela." onClose={() => setExported(false)} />
        </ToastViewport>
      ) : null}
    </>
  )
}

function TypeFilter({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded-md px-2 text-body-sm">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      {label}
    </label>
  )
}

function splitWhen(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value)
  if (!match) return { date: value, time: "" }
  return { date: `${match[3]}/${match[2]}/${match[1]}`, time: `${match[4]}:${match[5]}` }
}

function signed(value: number) {
  const formatted = money.format(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

export { ClubHistory }

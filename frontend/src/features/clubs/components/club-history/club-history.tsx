import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { exportClubTransactions, listClubTransactions } from "@/features/clubs/api/clubs.api"
import { HistoryEmpty } from "@/features/clubs/components/club-history/history-empty"
import { HistorySummary } from "@/features/clubs/components/club-history/history-summary"
import { HistoryTable } from "@/features/clubs/components/club-history/history-table"
import { TypeFilter } from "@/features/clubs/components/club-history/type-filter"
import { DEFAULT_TRANSACTION_TYPES, HISTORY_CSV_FILENAME } from "@/features/clubs/consts/history"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { TransactionType } from "@/features/clubs/types/transactions.types"
import { downloadBlob } from "@/features/clubs/utils/download-blob"
import { toggleTransactionType } from "@/features/clubs/utils/toggle-transaction-type"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastViewport } from "@/components/ui/toast"

function ClubHistory({ clubId, players }: { clubId: number; players: SquadPlayer[] }) {
  const [types, setTypes] = useState<TransactionType[]>([...DEFAULT_TRANSACTION_TYPES])
  const [playerId, setPlayerId] = useState("")
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
  const error =
    history.error instanceof Error
      ? history.error.message
      : history.error
        ? "Não foi possível carregar o histórico."
        : null
  const filtersChanged = types.length !== DEFAULT_TRANSACTION_TYPES.length || playerId !== ""

  async function download() {
    setExportError(null)
    setExporting(true)
    try {
      const file = await exportClubTransactions(clubId, {
        types,
        playerId: playerId ? Number(playerId) : undefined,
      })
      downloadBlob(file, HISTORY_CSV_FILENAME)
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
            <p className="text-caption-xs text-muted-foreground">
              Da mais recente para a mais antiga, com o nome gravado na transação.
            </p>
          </div>
          <Button type="button" variant="outline" disabled={!filtered || exporting} onClick={() => void download()}>
            <Download />
            Exportar CSV
          </Button>
        </header>
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
          <span className="text-body-sm-medium">Tipo</span>
          <TypeFilter
            label="Compra"
            checked={types.includes("COMPRA")}
            onChange={(checked) => setTypes((current) => toggleTransactionType(current, "COMPRA", checked))}
          />
          <TypeFilter
            label="Venda"
            checked={types.includes("VENDA")}
            onChange={(checked) => setTypes((current) => toggleTransactionType(current, "VENDA", checked))}
          />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Select
            value={playerId || null}
            onValueChange={(value) => setPlayerId(value && value !== "all" ? value : "")}
          >
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
                setTypes([...DEFAULT_TRANSACTION_TYPES])
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
        {!error && rows.length === 0 && !history.isPending ? <HistoryEmpty /> : null}
        {rows.length > 0 ? <HistoryTable rows={rows} /> : null}
        {summary && !error ? <HistorySummary summary={summary} /> : null}
      </section>
      <p className="text-caption-xs text-muted-foreground">
        Na compra, o lucro aparece como traço. A variação do caixa sai negativa na compra e positiva na venda.
      </p>
      {exportError ? <Alert variant="destructive" title="Exportação recusada" description={exportError} /> : null}
      {exported ? (
        <ToastViewport>
          <Toast
            variant="success"
            title="CSV baixado"
            description="O arquivo usa o mesmo filtro da tabela."
            onClose={() => setExported(false)}
          />
        </ToastViewport>
      ) : null}
    </>
  )
}

export { ClubHistory }

import { History } from "lucide-react"

function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <History className="size-6" aria-hidden />
      </span>
      <p className="text-heading-card">Nenhuma transação ainda</p>
      <p className="max-w-md text-body-sm text-muted-foreground">
        As compras e vendas do clube aparecem aqui, com valor, taxa, multa e a variação do caixa.
      </p>
    </div>
  )
}

export { HistoryEmpty }

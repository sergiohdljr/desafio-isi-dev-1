import { Shirt, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

function EmptySquad({ onBrowse }: { onBrowse: () => void }) {
  return (
    <section className="w-full rounded-[12px] border border-border bg-card shadow-xs">
      <div className="flex flex-col items-center gap-[12px] px-[24px] py-[48px] text-center">
        <span className="inline-flex rounded-[12px] bg-muted p-[12px] text-muted-foreground">
          <Shirt className="size-6" aria-hidden />
        </span>
        <h2 className="text-heading-card">Nenhum jogador no elenco</h2>
        <p className="w-[420px] max-w-full text-body-sm text-muted-foreground">
          Compre jogadores livres para montar o elenco. O limite é de 12 jogadores, e o custo de cada compra não pode
          passar de 50% do caixa.
        </p>
        <Button type="button" variant="outline" className="h-[36px] gap-[8px] px-[16px]!" onClick={onBrowse}>
          <Users />
          Ver jogadores livres
        </Button>
      </div>
    </section>
  )
}

export { EmptySquad }

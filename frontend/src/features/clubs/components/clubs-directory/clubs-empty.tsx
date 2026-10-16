import { Plus, Shield } from "lucide-react"
import { STARTING_CASH } from "@/features/clubs/consts/club-draft"
import { Button } from "@/components/ui/button"
import { money } from "@/features/players/consts/directory"

function ClubsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="w-full rounded-[12px] border border-border bg-card shadow-xs">
      <div className="flex flex-col items-center gap-[12px] px-[24px] py-[48px] text-center">
        <span className="inline-flex rounded-[12px] bg-muted p-[12px] text-muted-foreground">
          <Shield className="size-6" aria-hidden />
        </span>
        <h2 className="text-heading-card">Nenhum clube cadastrado</h2>
        <p className="w-[420px] max-w-full text-body-sm text-muted-foreground">
          Crie o primeiro clube com nome e sigla. Ele começa com {money.format(STARTING_CASH)} em caixa e sem jogadores.
        </p>
        <Button type="button" variant="outline" className="h-[36px] gap-[8px] px-[16px]!" onClick={onCreate}>
          <Plus />
          Novo clube
        </Button>
      </div>
    </section>
  )
}

export { ClubsEmpty }

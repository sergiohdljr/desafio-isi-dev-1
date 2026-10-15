import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router"
import { paths } from "@/app/routes"
import type { Club } from "@/features/clubs/types/club.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Escudo } from "@/components/ui/escudo"
import { money } from "@/features/players/consts/directory"

function ClubsTable({ clubs }: { clubs: Club[] }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-left">
        <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
          <tr className="h-[40px] bg-muted-subtle">
            <th className="pr-[8px] pl-[16px] font-medium">Clube</th>
            <th className="w-[90px] px-[8px] font-medium">Sigla</th>
            <th className="w-[150px] px-[8px] text-right font-medium">Caixa</th>
            <th className="w-[160px] px-[8px] text-right font-medium">Valor do elenco</th>
            <th className="w-[160px] px-[8px] text-right font-medium">Patrimônio</th>
            <th className="w-[140px] pr-[16px] pl-[8px]" />
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.id} className="h-[60px] border-b border-border last:border-b-0">
              <td className="pr-[8px] pl-[16px]">
                <span className="flex items-center gap-[12px]">
                  <Escudo sigla={club.acronym} />
                  <span className="text-body-sm-medium">{club.name}</span>
                </span>
              </td>
              <td className="px-[8px]">
                <Badge variant="outline">{club.acronym}</Badge>
              </td>
              <td className="px-[8px] text-right text-body-sm tabular-nums">{money.format(club.cash)}</td>
              <td className="px-[8px] text-right text-body-sm tabular-nums">{money.format(club.squad_value)}</td>
              <td className="px-[8px] text-right text-body-sm-semibold tabular-nums">
                {money.format(club.net_worth)}
              </td>
              <td className="pr-[16px] pl-[8px] text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-[32px] gap-[6px] px-[12px]!"
                  onClick={() => navigate(paths.club(club.id))}
                >
                  Ver clube
                  <ChevronRight className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { ClubsTable }

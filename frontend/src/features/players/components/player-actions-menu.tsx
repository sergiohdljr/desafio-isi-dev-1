import { Eye, Ellipsis, HeartPulse, Pencil, ShoppingCart, Trash2 } from "lucide-react"
import { Menu } from "@base-ui/react/menu"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Player } from "@/features/players/types/player.types"

const ITEM_CLASS =
  "flex h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 text-left text-body-sm text-popover-foreground outline-none data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50"

const FREE_NOTE = "Disponível porque o jogador está livre."

function PlayerActionsMenu({
  player,
  onDetails,
  onEdit,
  onCondition,
  onBuy,
  onDelete,
}: {
  player: Player
  onDetails: () => void
  onEdit: () => void
  onCondition: () => void
  onBuy: () => void
  onDelete: () => void
}) {
  const free = player.club_id === null

  return (
    <Menu.Root>
      <Menu.Trigger
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label={`Ações de ${player.name}`}
      >
        <Ellipsis />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="z-50" side="bottom" align="end" sideOffset={4}>
          <Menu.Popup className="w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            <Menu.Group>
              <Menu.GroupLabel className="px-2 py-1.5 text-caption-xs-medium text-muted-foreground">
                {player.name}
              </Menu.GroupLabel>
            </Menu.Group>
            <Menu.Item className={ITEM_CLASS} onClick={onDetails}>
              <Eye className="size-4 text-muted-foreground" />
              Ver detalhes
            </Menu.Item>
            <Menu.Item className={ITEM_CLASS} onClick={onEdit}>
              <Pencil className="size-4 text-muted-foreground" />
              Editar
            </Menu.Item>
            <Menu.Item className={ITEM_CLASS} onClick={onCondition}>
              <HeartPulse className="size-4 text-muted-foreground" />
              Alterar condição
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item className={ITEM_CLASS} disabled={!free} onClick={onBuy}>
              <ShoppingCart className="size-4 text-muted-foreground" />
              Comprar
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item
              className={cn(ITEM_CLASS, "text-destructive")}
              disabled={!free}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Excluir
            </Menu.Item>
            {free ? (
              <p className="pr-2 pb-1.5 pl-8 text-caption-xs text-muted-foreground">{FREE_NOTE}</p>
            ) : null}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

export { PlayerActionsMenu }

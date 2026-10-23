import type { Club } from "@/features/clubs/types/club.types"
import {
  BuyPlayerDialog,
  ConditionDialog,
  CreatedPlayerDialog,
  CreatePlayerDialog,
  DeletePlayerDialog,
  DetailsDialog,
  EditPlayerDialog,
} from "@/features/players/components/player-dialogs"
import { money } from "@/features/players/consts/directory"
import type { usePlayerMutations } from "@/features/players/hooks/use-players"
import type { PlayersDialog, PlayersNotice } from "@/features/players/types/players-ui.types"
import { conditionLabel } from "@/features/players/utils/player-display"

function PlayersDialogHost({
  dialog,
  clubs,
  starterClub,
  mutations,
  onClose,
  onFinish,
  onOpen,
}: {
  dialog: PlayersDialog | null
  clubs: Club[]
  starterClub: string | null
  mutations: ReturnType<typeof usePlayerMutations>
  onClose: () => void
  onFinish: (notice: PlayersNotice) => void
  onOpen: (dialog: PlayersDialog) => void
}) {
  if (!dialog) return null

  if (dialog.type === "create") {
    return (
      <CreatePlayerDialog
        onClose={onClose}
        onSubmit={async (input) => {
          const created = await mutations.createPlayer(input)
          onOpen({ type: "created", player: created })
        }}
      />
    )
  }

  if (dialog.type === "created") {
    return (
      <CreatedPlayerDialog
        player={dialog.player}
        onClose={onClose}
        onDetails={() => onOpen({ type: "details", player: dialog.player })}
      />
    )
  }

  if (dialog.type === "edit") {
    return (
      <EditPlayerDialog
        player={dialog.player}
        onClose={onClose}
        onSubmit={async (input) => {
          await mutations.updatePlayer(dialog.player.id, input)
          onFinish({
            variant: "success",
            title: "Jogador atualizado",
            description: "Dados do jogador foram atualizados com sucesso.",
          })
        }}
      />
    )
  }

  if (dialog.type === "condition") {
    return (
      <ConditionDialog
        player={dialog.player}
        starterClub={starterClub}
        onClose={onClose}
        onSubmit={async (next) => {
          const updated = await mutations.changeCondition(dialog.player.id, next)
          onFinish({
            variant: "success",
            title: "Condição alterada",
            description: `${updated.name} agora está ${conditionLabel(updated.condition)}. Valor de mercado: ${money.format(updated.market_value)}.`,
          })
        }}
      />
    )
  }

  if (dialog.type === "delete") {
    return (
      <DeletePlayerDialog
        player={dialog.player}
        onClose={onClose}
        onConfirm={async () => {
          const name = dialog.player.name
          await mutations.deletePlayer(dialog.player.id)
          onFinish({
            variant: "success",
            title: "Jogador excluído",
            description: `${name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
          })
        }}
      />
    )
  }

  if (dialog.type === "details") {
    return (
      <DetailsDialog
        player={dialog.player}
        clubName={clubs.find((club) => club.id === dialog.player.club_id)?.name}
        onClose={onClose}
        onEdit={() => onOpen({ type: "edit", player: dialog.player })}
        onCondition={() => onOpen({ type: "condition", player: dialog.player })}
        onBuy={dialog.player.club_id === null ? () => onOpen({ type: "buy", player: dialog.player }) : undefined}
      />
    )
  }

  return (
    <BuyPlayerDialog
      player={dialog.player}
      clubs={clubs}
      onClose={onClose}
      onSubmit={(nextClubId, loyaltyUntil) => mutations.buyPlayer(dialog.player.id, nextClubId, loyaltyUntil)}
    />
  )
}

export { PlayersDialogHost }

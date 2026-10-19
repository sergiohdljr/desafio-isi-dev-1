import type { Club, SquadPlayer } from "@/features/clubs/types/club.types"
import type { Player } from "@/features/players/types/player.types"

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: "Davi Melo",
    position: "ATA",
    agility: 80,
    age: 24,
    condition: "APTO",
    base_value: 1_000_000,
    market_value: 1_200_000,
    pace: 70,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defending: 70,
    physical: 70,
    potential: 80,
    overall: 75,
    club_id: null,
    ...overrides,
  }
}

function makeClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 10,
    name: "Clube Aurora",
    acronym: "AUR",
    cash: 5_000_000,
    squad_value: 2_000_000,
    net_worth: 7_000_000,
    ...overrides,
  }
}

function makeSquadPlayer(overrides: Partial<SquadPlayer> = {}): SquadPlayer {
  const { contract, ...playerOverrides } = overrides
  return {
    ...makePlayer(playerOverrides),
    club_id: playerOverrides.club_id ?? 10,
    contract: {
      purchase_value: 1_000_000,
      loyalty_until: "2030-01-01T12:00:00.000-03:00",
      remaining_days: 100,
      ...contract,
    },
  }
}

export { makeClub, makePlayer, makeSquadPlayer }

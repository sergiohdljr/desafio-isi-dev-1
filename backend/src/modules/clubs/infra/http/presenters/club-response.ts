import { presentPlayer } from '../../../../players/infra/http/presenters/player-response.js';
import type { ClubView } from '../../../application/read-models/club-view.js';
import type { ClubDetailView } from '../../../application/use-cases/find-club.use-case.js';
import { formatBrasilia } from './brasilia-time.js';

export type ClubResponse = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
};

export function presentClub(view: ClubView): ClubResponse {
  return {
    id: view.id,
    name: view.name,
    acronym: view.acronym,
    cash: view.cash,
    squad_value: view.squadValue,
    net_worth: view.netWorth,
  };
}

export function presentClubDetail(view: ClubDetailView): ClubResponse & {
  players: Array<
    ReturnType<typeof presentPlayer> & {
      contract: {
        purchase_value: number;
        loyalty_until: string;
        remaining_days: number;
        penalty_rate: number;
      };
    }
  >;
} {
  return {
    ...presentClub(view),
    players: view.players.map((player) => ({
      ...presentPlayer(player),
      contract: {
        purchase_value: player.contract.purchaseValue,
        loyalty_until: formatBrasilia(player.contract.loyaltyUntil),
        remaining_days: player.contract.remainingDays,
        penalty_rate: player.contract.penaltyRate,
      },
    })),
  };
}

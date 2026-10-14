import { ClubView } from '../../../application/read-models/club-view.js';
import { ClubDetailView } from '../../../application/use-cases/find-club.use-case.js';

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
  players: ClubDetailView['players'];
} {
  return { ...presentClub(view), players: view.players };
}

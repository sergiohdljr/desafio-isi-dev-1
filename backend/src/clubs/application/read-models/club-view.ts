import { Club } from '../../domain/entities/club.js';

export type ClubView = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squadValue: number;
  netWorth: number;
};

export function clubViewOf(club: Club): ClubView {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash.amount,
    squadValue: 0,
    netWorth: club.cash.amount,
  };
}

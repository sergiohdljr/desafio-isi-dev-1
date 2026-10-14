import { Player } from '../../../players/domain/entities/player.js';
import { Money } from '../../../../shared/domain/money.js';
import { Club } from '../../domain/entities/club.js';

export const CLUBS_REPOSITORY = Symbol('CLUBS_REPOSITORY');

export type SquadMember = {
  clubId: number;
  player: Player;
  purchaseValue: Money;
  loyaltyUntil: Date;
};

export interface ClubsRepository {
  add(club: Club): Promise<Club>;
  findById(id: number): Promise<Club | null>;
  count(): Promise<number>;
  nameTaken(name: string): Promise<boolean>;
  acronymTaken(acronym: string): Promise<boolean>;
  list(): Promise<Club[]>;
  squad(): Promise<SquadMember[]>;
}

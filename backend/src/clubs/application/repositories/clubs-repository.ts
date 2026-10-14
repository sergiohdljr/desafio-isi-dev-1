import { Club } from '../../domain/entities/club.js';

export const CLUBS_REPOSITORY = Symbol('CLUBS_REPOSITORY');

export interface ClubsRepository {
  add(club: Club): Promise<Club>;
  findById(id: number): Promise<Club | null>;
  count(): Promise<number>;
  nameTaken(name: string): Promise<boolean>;
  acronymTaken(acronym: string): Promise<boolean>;
}

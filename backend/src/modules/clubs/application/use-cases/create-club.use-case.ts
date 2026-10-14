import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Club, MAX_CLUBS } from '../../domain/entities/club.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';

export const CREATE_CLUB = Symbol('CREATE_CLUB');

export interface CreateClubPort {
  execute(input: { name: string; acronym: string }): Promise<ClubView>;
}

@Injectable()
export class CreateClub implements CreateClubPort {
  constructor(
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
  ) {}

  async execute(input: { name: string; acronym: string }): Promise<ClubView> {
    if ((await this.clubs.count()) >= MAX_CLUBS) {
      throw new DomainError('conflict', 'A liga aceita no máximo 20 clubes');
    }
    if (await this.clubs.nameTaken(input.name)) {
      throw new DomainError('conflict', 'Nome de clube já cadastrado');
    }
    if (await this.clubs.acronymTaken(input.acronym)) {
      throw new DomainError('conflict', 'Sigla de clube já cadastrada');
    }

    return clubViewOf(
      await this.clubs.add(Club.open(input.name, input.acronym)),
    );
  }
}

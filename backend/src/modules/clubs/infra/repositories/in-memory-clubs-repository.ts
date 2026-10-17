import { Club } from '../../domain/entities/club.js';
import { sameClubName } from '../../domain/entities/club-name.js';
import { type ClubsRepository } from '../../application/repositories/clubs-repository.js';

export class InMemoryClubsRepository implements ClubsRepository {
  readonly saved: Club[] = [];
  private nextId: number;

  constructor(private readonly clubs: Club[] = []) {
    this.nextId = clubs.reduce((max, club) => Math.max(max, club.id), 0) + 1;
  }

  async add(club: Club): Promise<Club> {
    const opened = Club.open(club.name, club.acronym);
    const created = Club.reconstitute({
      id: this.nextId,
      name: opened.name,
      acronym: opened.acronym,
      cash: opened.cash,
    });
    this.nextId += 1;
    this.clubs.push(created);
    this.saved.push(created);
    return created;
  }

  async findById(id: number): Promise<Club | null> {
    return this.clubs.find((club) => club.id === id) ?? null;
  }

  async count(): Promise<number> {
    return this.clubs.length;
  }

  async nameTaken(name: string): Promise<boolean> {
    return this.clubs.some((club) => sameClubName(club.name, name));
  }

  async acronymTaken(acronym: string): Promise<boolean> {
    return this.clubs.some((club) => club.acronym === acronym);
  }

  async list(): Promise<Club[]> {
    return this.clubs;
  }
}

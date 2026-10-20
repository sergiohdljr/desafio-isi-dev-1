import type { Money } from '../../../../shared/domain/money.js';
import { squadValueOf } from '../../domain/entities/squad.js';
import {
  type SquadMember,
  type SquadReader,
} from '../../application/repositories/squad-reader.js';

export class InMemorySquadReader implements SquadReader {
  constructor(private readonly members: SquadMember[] = []) {}

  async listByClub(clubId: number): Promise<SquadMember[]> {
    return this.members.filter((member) => member.clubId === clubId);
  }

  async squadValues(): Promise<Map<number, Money>> {
    const values = new Map<number, Money[]>();
    for (const member of this.members) {
      const current = values.get(member.clubId) ?? [];
      current.push(member.player.marketValue);
      values.set(member.clubId, current);
    }

    return new Map(
      [...values].map(([clubId, amounts]) => [clubId, squadValueOf(amounts)]),
    );
  }
}

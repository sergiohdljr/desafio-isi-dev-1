import { Test } from '@nestjs/testing';
import { Club } from '../../../../clubs/domain/entities/club.js';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/repositories/in-memory-clubs-repository.js';
import { Player } from '../../../../players/domain/entities/player.js';
import { PLAYERS_REPOSITORY } from '../../../../players/application/repositories/players-repository.js';
import { InMemoryPlayersRepository } from '../../../../players/infra/repositories/in-memory-players-repository.js';
import { Money } from '../../../../../shared/domain/money.js';
import { InMemoryMarketRepository } from '../../../infra/repositories/in-memory-market-repository.js';
import {
  MARKET_REPOSITORY,
  type StoredTransaction,
} from '../../repositories/market-repository.js';
import { ListTransactions } from '../list-transactions.use-case.js';

function club(id: number): Club {
  const opened = Club.open('Alpha FC', 'AFC');
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

function player(id: number): Player {
  const draft = Player.register({
    name: 'Meia Lua',
    position: 'MEI',
    agility: 50,
    age: 25,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 50,
  });
  return Player.reconstitute({
    id,
    name: draft.name,
    position: draft.position,
    agility: draft.agility,
    age: draft.age,
    condition: draft.condition,
    baseValue: draft.baseValue,
    pace: draft.pace,
    shooting: draft.shooting,
    passing: draft.passing,
    dribbling: draft.dribbling,
    defending: draft.defending,
    physical: draft.physical,
    potential: draft.potential,
    clubId: 1,
    excluded: false,
  });
}

const purchase: StoredTransaction = {
  id: 4,
  clubId: 1,
  playerId: 7,
  playerName: 'Meia Lua',
  type: 'COMPRA',
  value: Money.fromCents(4000),
  fee: Money.fromCents(200),
  penalty: Money.fromCents(0),
  profit: null,
  cashChange: Money.fromCents(-4200),
  createdAt: new Date('2026-10-14T15:00:00.000Z'),
};

async function list(options: {
  clubs?: Club[];
  players?: Player[];
  transactions?: StoredTransaction[];
}) {
  const module = await Test.createTestingModule({
    providers: [
      ListTransactions,
      {
        provide: MARKET_REPOSITORY,
        useValue: new InMemoryMarketRepository([], [], options.transactions),
      },
      {
        provide: CLUBS_REPOSITORY,
        useValue: new InMemoryClubsRepository(options.clubs),
      },
      {
        provide: PLAYERS_REPOSITORY,
        useValue: new InMemoryPlayersRepository(options.players),
      },
    ],
  }).compile();
  return module.get(ListTransactions);
}

describe('list transactions', () => {
  it('refuses a missing club', async () => {
    const history = await list({});
    await expect(history.execute(4, {})).rejects.toMatchObject({
      kind: 'missing',
    });
  });

  it('refuses a missing player filter', async () => {
    const history = await list({ clubs: [club(1)] });
    await expect(history.execute(1, { playerId: 9 })).rejects.toMatchObject({
      kind: 'missing',
    });
  });

  it('returns the filtered purchases and their summary', async () => {
    const history = await list({
      clubs: [club(1)],
      players: [player(7)],
      transactions: [purchase],
    });

    const page = await history.execute(1, { playerId: 7, types: ['COMPRA'] });

    expect(page.data).toHaveLength(1);
    expect(page.data[0]).toMatchObject({ id: 4, type: 'COMPRA', value: 40 });
    expect(page.summary).toMatchObject({
      totalSpent: 42,
      totalReceived: 0,
      totalFees: 2,
    });
  });
});

import {
  presentClub,
  presentClubDetail,
} from '../modules/clubs/infra/http/presenters/club-response.js';
import {
  presentLineup,
  presentMatch,
  presentMatchSummary,
  presentStanding,
} from '../modules/league/infra/http/presenters/league-response.js';
import { presentPurchase } from '../modules/market/infra/http/presenters/purchase-response.js';
import { presentSale } from '../modules/market/infra/http/presenters/sale-response.js';
import { presentTransactions } from '../modules/market/infra/http/presenters/transaction-response.js';
import {
  presentPlayer,
  presentPlayerList,
} from '../modules/players/infra/http/presenters/player-response.js';
import type { PlayerView } from '../modules/players/application/read-models/player-view.js';
import {
  clubDetailResponseSchema,
  clubResponseSchema,
  lineupResponseSchema,
  matchResponseSchema,
  matchSummaryResponseSchema,
  playerListResponseSchema,
  playerResponseSchema,
  purchaseResponseSchema,
  saleResponseSchema,
  standingResponseSchema,
  transactionListResponseSchema,
} from './response-schemas.js';

const at = new Date('2027-03-02T13:15:00.000Z');

const player: PlayerView = {
  id: 1,
  name: 'Ana Lima',
  position: 'MEI',
  agility: 50,
  age: 25,
  condition: 'APTO',
  baseValue: 25.5,
  marketValue: 40,
  pace: 70,
  shooting: 60,
  passing: 80,
  dribbling: 75,
  defending: 40,
  physical: 65,
  potential: 85,
  overall: 68,
  clubId: null,
};

describe('response schemas', () => {
  it('accepts the presenter output', () => {
    expect(playerResponseSchema.parse(presentPlayer(player))).toMatchObject({
      name: 'Ana Lima',
      market_value: 40,
    });
    expect(
      playerListResponseSchema.parse(
        presentPlayerList({
          data: [player],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 1,
            totalPages: 1,
            counts: { all: 1, free: 1, signed: 0 },
          },
        }),
      ).meta.total_items,
    ).toBe(1);
    expect(
      clubResponseSchema.parse(
        presentClub({
          id: 2,
          name: 'Águias FC',
          acronym: 'AFC',
          cash: 300,
          squadValue: 40,
          netWorth: 340,
        }),
      ).net_worth,
    ).toBe(340);
    expect(
      clubDetailResponseSchema.parse(
        presentClubDetail({
          id: 2,
          name: 'Águias FC',
          acronym: 'AFC',
          cash: 274.5,
          squadValue: 40,
          netWorth: 314.5,
          players: [
            {
              ...player,
              clubId: 2,
              contract: {
                purchaseValue: 25.5,
                loyaltyUntil: at,
                remainingDays: 3,
                penaltyRate: 5,
              },
            },
          ],
        }),
      ).players[0].contract.purchase_value,
    ).toBe(25.5);
    expect(
      purchaseResponseSchema.parse(
        presentPurchase({
          id: 8,
          clubId: 2,
          playerId: 1,
          playerName: 'Ana Lima',
          value: 40,
          fee: 2,
          penalty: 0,
          profit: null,
          cashChange: -42,
          createdAt: at,
          loyaltyUntil: at,
          clubCash: 258,
        }),
      ).type,
    ).toBe('COMPRA');
    expect(
      saleResponseSchema.parse(
        presentSale({
          id: 9,
          clubId: 2,
          playerId: 1,
          playerName: 'Ana Lima',
          value: 40,
          fee: 2,
          penalty: 4,
          profit: 15,
          cashChange: 34,
          createdAt: at,
          purchaseValue: 25,
          remainingDays: 12,
          penaltyRate: 10,
          contractStatus: 'RESCINDIDO',
          clubCash: 334,
        }),
      ).contract_status,
    ).toBe('RESCINDIDO');
    expect(
      transactionListResponseSchema.parse(
        presentTransactions({
          data: [
            {
              id: 9,
              clubId: 2,
              playerId: 1,
              playerName: 'Ana Lima',
              type: 'VENDA',
              value: 40,
              fee: 2,
              penalty: 4,
              profit: 15,
              cashChange: 34,
              createdAt: at,
            },
            {
              id: 8,
              clubId: 2,
              playerId: 1,
              playerName: 'Ana Lima',
              type: 'COMPRA',
              value: 40,
              fee: 2,
              penalty: 0,
              profit: null,
              cashChange: -42,
              createdAt: at,
            },
          ],
          summary: {
            totalSpent: 42,
            totalReceived: 40,
            totalFees: 4,
            totalPenalties: 4,
            totalProfit: 15,
          },
        }),
      ).data[1].profit,
    ).toBeNull();
    expect(
      lineupResponseSchema.parse(
        presentLineup({
          clubId: 2,
          formation: null,
          complete: false,
          players: [],
        }),
      ).formation,
    ).toBeNull();
    expect(
      lineupResponseSchema.parse(
        presentLineup({
          clubId: 2,
          formation: '2-1-1',
          complete: true,
          players: [{ ...player, clubId: 2 }],
        }),
      ).complete,
    ).toBe(true);

    const match = {
      id: 3,
      playedAt: at,
      homeClubId: 2,
      awayClubId: 4,
      homeName: 'Águias FC',
      awayName: 'Delta FC',
      homeFormation: '2-1-1' as const,
      awayFormation: '2-1-1' as const,
      homeGoals: 1,
      awayGoals: 2,
      result: 'VISITANTE' as const,
      duels: [
        {
          order: 1,
          attackingClubId: 2,
          attacker: {
            playerId: 1,
            playerName: 'Ana Lima',
            position: 'ATA' as const,
            condition: 'APTO' as const,
            attribute: 'shooting' as const,
            value: 60,
          },
          defender: {
            playerId: 5,
            playerName: 'Davi Lins',
            position: 'GOL' as const,
            condition: 'MAL_CONDICIONADO' as const,
            attribute: 'defending' as const,
            value: 56,
          },
          goal: false,
        },
      ],
    };
    expect(
      matchSummaryResponseSchema.parse(presentMatchSummary(match)).result,
    ).toBe('VISITANTE');
    expect(matchResponseSchema.parse(presentMatch(match)).duels).toHaveLength(
      1,
    );
    expect(
      standingResponseSchema.parse(
        presentStanding({
          position: 1,
          clubId: 2,
          clubName: 'Gama FC',
          played: 2,
          wins: 2,
          draws: 0,
          losses: 0,
          goalsFor: 3,
          goalsAgainst: 1,
          goalDifference: 2,
          points: 6,
        }),
      ).points,
    ).toBe(6);
  });
});

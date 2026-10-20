import { z } from 'zod';
import { FORMATIONS } from '../modules/league/domain/formation.js';
import {
  CONDITIONS,
  POSITIONS,
} from '../modules/players/domain/types/player-types.js';

const brasiliaTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/);
const money = z.number();
const duelCondition = z.enum(['APTO', 'MAL_CONDICIONADO']);
const duelAttribute = z.enum(['shooting', 'passing', 'dribbling', 'defending']);

export const errorBodySchema = z.object({
  message: z.string().min(1),
});

export const playerResponseSchema = z.object({
  id: z.int(),
  name: z.string(),
  position: z.enum(POSITIONS),
  agility: z.int(),
  age: z.int(),
  condition: z.enum(CONDITIONS),
  base_value: money,
  market_value: money,
  pace: z.int(),
  shooting: z.int(),
  passing: z.int(),
  dribbling: z.int(),
  defending: z.int(),
  physical: z.int(),
  potential: z.int(),
  overall: z.int(),
  club_id: z.int().nullable(),
});

export const playerListResponseSchema = z.object({
  data: z.array(playerResponseSchema),
  meta: z.object({
    page: z.int(),
    limit: z.int(),
    total_items: z.int(),
    total_pages: z.int(),
    counts: z.object({ all: z.int(), free: z.int(), signed: z.int() }),
  }),
});

export const clubResponseSchema = z.object({
  id: z.int(),
  name: z.string(),
  acronym: z.string(),
  cash: money,
  squad_value: money,
  net_worth: money,
});

export const clubDetailResponseSchema = clubResponseSchema.extend({
  players: z.array(
    playerResponseSchema.extend({
      contract: z.object({
        purchase_value: money,
        loyalty_until: brasiliaTime,
        remaining_days: z.int(),
        penalty_rate: z.union([
          z.literal(0),
          z.literal(5),
          z.literal(10),
          z.literal(20),
        ]),
      }),
    }),
  ),
});

export const clubListResponseSchema = z.array(clubResponseSchema);

const purchaseContract = z.object({
  purchase_value: money,
  loyalty_until: brasiliaTime,
  status: z.literal('ATIVO'),
});

export const purchaseResponseSchema = z.object({
  id: z.int(),
  club_id: z.int(),
  player_id: z.int(),
  player_name: z.string(),
  type: z.literal('COMPRA'),
  value: money,
  fee: money,
  penalty: money,
  profit: z.null(),
  cash_change: money,
  created_at: brasiliaTime,
  contract: purchaseContract,
  club_cash: money,
});

export const saleResponseSchema = z.object({
  id: z.int(),
  club_id: z.int(),
  player_id: z.int(),
  player_name: z.string(),
  type: z.literal('VENDA'),
  value: money,
  fee: money,
  penalty: money,
  profit: money,
  cash_change: money,
  created_at: brasiliaTime,
  purchase_value: money,
  remaining_days: z.int(),
  penalty_rate: z.number(),
  contract_status: z.enum(['ENCERRADO', 'RESCINDIDO']),
  club_cash: money,
});

const transactionItemSchema = z.object({
  id: z.int(),
  club_id: z.int(),
  player_id: z.int(),
  player_name: z.string(),
  type: z.enum(['COMPRA', 'VENDA']),
  value: money,
  fee: money,
  penalty: money,
  profit: money.nullable(),
  cash_change: money,
  created_at: brasiliaTime,
});

export const transactionListResponseSchema = z.object({
  data: z.array(transactionItemSchema),
  summary: z.object({
    total_spent: money,
    total_received: money,
    total_fees: money,
    total_penalties: money,
    total_profit: money,
  }),
});

export const lineupResponseSchema = z.object({
  club_id: z.int(),
  formation: z.enum(FORMATIONS).nullable(),
  complete: z.boolean(),
  players: z.array(playerResponseSchema),
});

const matchSideSchema = z.object({
  club_id: z.int(),
  club_name: z.string(),
  formation: z.enum(FORMATIONS),
  goals: z.int(),
});

const duelSideSchema = z.object({
  player_id: z.int(),
  player_name: z.string(),
  position: z.enum(POSITIONS),
  condition: duelCondition,
  attribute: duelAttribute,
  value: z.int(),
});

export const matchSummaryResponseSchema = z.object({
  id: z.int(),
  played_at: brasiliaTime,
  home: matchSideSchema,
  away: matchSideSchema,
  result: z.enum(['MANDANTE', 'VISITANTE', 'EMPATE']),
});

export const matchResponseSchema = matchSummaryResponseSchema.extend({
  duels: z.array(
    z.object({
      order: z.int(),
      attacking_club_id: z.int(),
      attacker: duelSideSchema,
      defender: duelSideSchema,
      goal: z.boolean(),
    }),
  ),
});

export const matchListResponseSchema = z.array(matchSummaryResponseSchema);

export const standingResponseSchema = z.object({
  position: z.int(),
  club_id: z.int(),
  club_name: z.string(),
  played: z.int(),
  wins: z.int(),
  draws: z.int(),
  losses: z.int(),
  goals_for: z.int(),
  goals_against: z.int(),
  goal_difference: z.int(),
  points: z.int(),
});

export const standingListResponseSchema = z.array(standingResponseSchema);

export const responseSchemas = {
  Error: errorBodySchema,
  Player: playerResponseSchema,
  PlayerList: playerListResponseSchema,
  Club: clubResponseSchema,
  ClubDetail: clubDetailResponseSchema,
  ClubList: clubListResponseSchema,
  Purchase: purchaseResponseSchema,
  Sale: saleResponseSchema,
  TransactionList: transactionListResponseSchema,
  Lineup: lineupResponseSchema,
  Match: matchResponseSchema,
  MatchList: matchListResponseSchema,
  StandingList: standingListResponseSchema,
} as const;

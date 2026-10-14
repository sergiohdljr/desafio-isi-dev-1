import { DomainError } from '../../../shared/domain/domain-error.js';
import {
  type Condition,
  type Position,
} from '../../players/domain/types/player-types.js';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;

export type Formation = (typeof FORMATIONS)[number];

const shape: Record<
  Formation,
  { defense: number; midfield: number; attack: number }
> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export function lineupFits(
  formation: Formation,
  positions: Position[],
): boolean {
  if (positions.length !== 5) {
    return false;
  }

  let goalkeepers = 0;
  let defense = 0;
  let midfield = 0;
  let attack = 0;
  for (const position of positions) {
    if (position === 'GOL') {
      goalkeepers += 1;
    } else if (position === 'ZAG' || position === 'LAT') {
      defense += 1;
    } else if (position === 'MEI') {
      midfield += 1;
    } else {
      attack += 1;
    }
  }

  const expected = shape[formation];
  return (
    goalkeepers === 1 &&
    defense === expected.defense &&
    midfield === expected.midfield &&
    attack === expected.attack
  );
}

type LineupCandidate = {
  clubId: number | null;
  condition: Condition;
  position: Position;
};

export function assertEligibleLineup(
  formation: Formation,
  players: LineupCandidate[],
  clubId: number,
): void {
  if (players.some((player) => player.clubId !== clubId)) {
    throw new DomainError('conflict', 'Jogador fora do elenco');
  }
  if (players.some((player) => player.condition === 'DOENTE')) {
    throw new DomainError('conflict', 'Jogador doente não pode ser escalado');
  }
  if (
    !lineupFits(
      formation,
      players.map((player) => player.position),
    )
  ) {
    throw new DomainError('conflict', 'As posições não fecham a formação');
  }
}

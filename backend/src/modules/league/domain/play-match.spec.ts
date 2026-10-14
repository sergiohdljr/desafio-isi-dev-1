import { DomainError } from '../../../shared/domain/domain-error.js';
import {
  decideMatch,
  duelValue,
  type SideFacts,
  type SidePlayer,
} from './play-match.js';

describe('duel value', () => {
  it('keeps a fit player and takes 15 percent off a poorly conditioned one, half up', () => {
    expect(duelValue(75, 'APTO')).toBe(75);
    expect(duelValue(74, 'MAL_CONDICIONADO')).toBe(63);
    expect(duelValue(66, 'MAL_CONDICIONADO')).toBe(56);
    expect(duelValue(50, 'MAL_CONDICIONADO')).toBe(43);
  });
});

describe('playing a match', () => {
  it('plays Águias at home against Delta as 1-2, with the tied duel not scoring', () => {
    const played = decideMatch({
      home: side(1, 'Águias FC', '2-1-1', [
        player(30, 'Rui Prado', 'GOL', 'APTO', { defending: 77 }),
        player(32, 'Téo Brandão', 'ZAG', 'APTO', { defending: 84 }),
        player(31, 'Davi Lins', 'LAT', 'MAL_CONDICIONADO', {
          dribbling: 74,
          defending: 66,
        }),
        player(33, 'Lauro Neves', 'MEI', 'APTO', { passing: 82 }),
        player(34, 'Otto Rangel', 'ATA', 'APTO', { shooting: 75 }),
      ]),
      away: side(2, 'Delta FC', '2-1-1', [
        player(40, 'Ivo Teles', 'GOL', 'APTO', { defending: 72 }),
        player(41, 'Hugo Vaz', 'ZAG', 'APTO', { defending: 84 }),
        player(42, 'Lino Matos', 'LAT', 'APTO', {
          dribbling: 79,
          defending: 63,
        }),
        player(43, 'Nei Soares', 'MEI', 'APTO', { passing: 70 }),
        player(44, 'Ugo Falcão', 'ATA', 'APTO', { shooting: 81 }),
      ]),
    });

    expect(played.homeGoals).toBe(1);
    expect(played.awayGoals).toBe(2);
    expect(played.result).toBe('VISITANTE');
    expect(played.duels.map((duel) => duel.goal)).toEqual([
      true,
      false,
      false,
      true,
      false,
      true,
    ]);
    expect(played.duels[0]).toMatchObject({
      order: 1,
      attackingClubId: 1,
      attacker: { playerName: 'Otto Rangel', attribute: 'shooting', value: 75 },
      defender: { playerName: 'Ivo Teles', attribute: 'defending', value: 72 },
    });
    expect(played.duels[2]).toMatchObject({
      attacker: { playerName: 'Davi Lins', attribute: 'dribbling', value: 63 },
      defender: { playerName: 'Lino Matos', attribute: 'defending', value: 63 },
      goal: false,
    });
    expect(played.duels[5]).toMatchObject({
      order: 6,
      attackingClubId: 2,
      attacker: { playerName: 'Lino Matos', attribute: 'dribbling', value: 79 },
      defender: {
        playerName: 'Davi Lins',
        attribute: 'defending',
        value: 56,
        condition: 'MAL_CONDICIONADO',
      },
      goal: true,
    });
  });

  it('numbers two midfielders by name, so the earlier one defends the second duel', () => {
    const played = decideMatch({
      home: side(1, 'Casa FC', '1-2-1', [
        player(1, 'Rui Prado', 'GOL', 'APTO', { defending: 10 }),
        player(2, 'Téo Brandão', 'ZAG', 'APTO', { defending: 10 }),
        player(8, 'Caio Melo', 'MEI', 'APTO', { passing: 30 }),
        player(3, 'Bruno Melo', 'MEI', 'APTO', { passing: 20 }),
        player(5, 'Otto Rangel', 'ATA', 'APTO', { shooting: 40 }),
      ]),
      away: side(2, 'Fora FC', '1-2-1', [
        player(11, 'Ivo Teles', 'GOL', 'APTO', { defending: 10 }),
        player(12, 'Hugo Vaz', 'ZAG', 'APTO', { defending: 10 }),
        player(13, 'Lino Matos', 'MEI', 'APTO', { passing: 10 }),
        player(14, 'Nei Soares', 'MEI', 'APTO', { passing: 10 }),
        player(15, 'Ugo Falcão', 'ATA', 'APTO', { shooting: 10 }),
      ]),
    });

    expect(played.duels[1]?.attacker.playerName).toBe('Caio Melo');
    expect(played.duels[2]?.attacker.playerName).toBe('Bruno Melo');
    expect(played.duels[2]?.defender.playerName).toBe('Lino Matos');
  });

  it('refuses a club that does not exist or a lineup that is short a starter', () => {
    const ready = side(1, 'Casa FC', '2-2', [
      player(1, 'Rui Prado', 'GOL', 'APTO', {}),
      player(2, 'Téo Brandão', 'ZAG', 'APTO', {}),
      player(3, 'Davi Lins', 'LAT', 'APTO', {}),
      player(4, 'Otto Rangel', 'ATA', 'APTO', {}),
      player(5, 'Ugo Falcão', 'ATA', 'APTO', {}),
    ]);

    expect(() =>
      decideMatch({
        home: { club: null, formation: null, players: [] },
        away: ready,
      }),
    ).toThrow(DomainError);

    expect(() =>
      decideMatch({
        home: { ...ready, players: ready.players.slice(0, 4) },
        away: ready,
      }),
    ).toThrow(DomainError);
  });
});

function side(
  id: number,
  name: string,
  formation: SideFacts['formation'],
  players: SidePlayer[],
): SideFacts {
  return {
    club: { id, name },
    formation,
    players: players.map((starter) => ({ ...starter, clubId: id })),
  };
}

function player(
  id: number,
  name: string,
  position: SidePlayer['position'],
  condition: SidePlayer['condition'],
  skills: Partial<
    Pick<SidePlayer, 'shooting' | 'passing' | 'dribbling' | 'defending'>
  >,
): SidePlayer {
  return {
    id,
    name,
    position,
    condition,
    clubId: null,
    shooting: skills.shooting ?? 10,
    passing: skills.passing ?? 10,
    dribbling: skills.dribbling ?? 10,
    defending: skills.defending ?? 10,
  };
}

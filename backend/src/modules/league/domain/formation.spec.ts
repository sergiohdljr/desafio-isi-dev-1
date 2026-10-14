import { DomainError } from '../../../shared/domain/domain-error.js';
import { assertEligibleLineup, lineupFits } from './formation.js';

describe('lineup shape', () => {
  it('accepts the four futsal shapes and rejects a sector that does not match', () => {
    expect(lineupFits('3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'])).toBe(true);
    expect(lineupFits('2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'])).toBe(true);
    expect(lineupFits('2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])).toBe(true);
    expect(lineupFits('1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA'])).toBe(true);
    expect(lineupFits('3-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])).toBe(false);
    expect(lineupFits('2-1-1', ['GOL', 'GOL', 'LAT', 'MEI', 'ATA'])).toBe(
      false,
    );
  });

  it('refuses a player from another squad or a sick starter before saving', () => {
    const clubId = 4;
    const fit = [
      candidate('GOL', 'APTO', clubId),
      candidate('ZAG', 'APTO', clubId),
      candidate('LAT', 'APTO', clubId),
      candidate('MEI', 'APTO', clubId),
      candidate('ATA', 'APTO', clubId),
    ];

    expect(() => assertEligibleLineup('2-1-1', fit, clubId)).not.toThrow();

    const outsider = fit.map((player, index) =>
      index === 4 ? { ...player, clubId: 9 } : player,
    );
    expect(() => assertEligibleLineup('2-1-1', outsider, clubId)).toThrow(
      DomainError,
    );

    const sick = fit.map((player, index) =>
      index === 2 ? { ...player, condition: 'DOENTE' as const } : player,
    );
    expect(() => assertEligibleLineup('2-1-1', sick, clubId)).toThrow(
      DomainError,
    );
  });
});

function candidate(
  position: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA',
  condition: 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE',
  clubId: number,
) {
  return { position, condition, clubId };
}

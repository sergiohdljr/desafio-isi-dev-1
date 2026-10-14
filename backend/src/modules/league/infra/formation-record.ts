import { type formacao } from '../../../generated/prisma/enums.js';
import { type Formation } from '../domain/formation.js';

const toDb = {
  '3-1': 'tres_um',
  '2-2': 'dois_dois',
  '2-1-1': 'dois_um_um',
  '1-2-1': 'um_dois_um',
} as const satisfies Record<Formation, formacao>;

const fromDb: Record<formacao, Formation> = {
  tres_um: '3-1',
  dois_dois: '2-2',
  dois_um_um: '2-1-1',
  um_dois_um: '1-2-1',
};

export function formationToDb(formation: Formation): formacao {
  return toDb[formation];
}

export function formationFromDb(formation: formacao): Formation {
  return fromDb[formation];
}

export function optionalFormationFromDb(
  formation: formacao | null,
): Formation | null {
  return formation === null ? null : formationFromDb(formation);
}

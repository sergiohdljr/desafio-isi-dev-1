import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import {
  baseValueOf,
  marketValueOf,
  overallOf,
} from '../services/player-valuation.js';
import {
  CONDITIONS,
  POSITIONS,
  type Condition,
  type PlayerSkills,
  type Position,
} from '../types/player-types.js';

export { CONDITIONS, POSITIONS };
export type { Condition, PlayerSkills, Position };

export type RegisterPlayer = PlayerSkills & {
  name: string;
  position: Position;
  agility: number;
  age: number;
  potential: number;
};

export type RevisePlayer = {
  name: string;
  position: Position;
  agility: number;
  age: number;
};

export type PlayerState = PlayerSkills & {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  baseValue: Money;
  potential: number;
  clubId: number | null;
  excluded: boolean;
};

export class Player {
  private constructor(
    private readonly playerId: number | null,
    private _name: string,
    private _position: Position,
    private _agility: number,
    private _age: number,
    private _condition: Condition,
    private readonly _baseValue: Money,
    private readonly skills: PlayerSkills,
    private readonly _potential: number,
    private readonly _clubId: number | null,
    private _excluded: boolean,
  ) {}

  static register(input: RegisterPlayer): Player {
    assertRegistration(input);
    const skills = skillsOf(input);
    return new Player(
      null,
      input.name,
      input.position,
      input.agility,
      input.age,
      'APTO',
      baseValueOf(
        overallOf(input.position, skills),
        input.potential,
        input.age,
      ),
      skills,
      input.potential,
      null,
      false,
    );
  }

  static reconstitute(state: PlayerState): Player {
    return new Player(
      state.id,
      state.name,
      state.position,
      state.agility,
      state.age,
      state.condition,
      state.baseValue,
      {
        pace: state.pace,
        shooting: state.shooting,
        passing: state.passing,
        dribbling: state.dribbling,
        defending: state.defending,
        physical: state.physical,
      },
      state.potential,
      state.clubId,
      state.excluded,
    );
  }

  revise(input: RevisePlayer): void {
    if (input.age < this._age) {
      throw new DomainError(
        'conflict',
        'A idade não pode ser menor que a atual',
      );
    }
    if (this._clubId !== null && input.position !== this._position) {
      throw new DomainError(
        'conflict',
        'Jogador com clube não muda de posição',
      );
    }
    assertAgility(input.age, input.agility);

    this._name = input.name;
    this._position = input.position;
    this._agility = input.agility;
    this._age = input.age;
  }

  changeCondition(condition: Condition): boolean {
    if (this._condition === 'DOENTE' && condition === 'APTO') {
      throw new DomainError(
        'conflict',
        'Um jogador doente não passa direto para apto',
      );
    }
    if (this._condition === condition) {
      return false;
    }

    this._condition = condition;
    return true;
  }

  exclude(): void {
    if (this._clubId !== null) {
      throw new DomainError(
        'conflict',
        'Jogador de um clube não pode ser excluído',
      );
    }

    this._excluded = true;
  }

  get id(): number {
    if (this.playerId === null) {
      throw new Error('Jogador ainda não persistido');
    }
    return this.playerId;
  }

  get name(): string {
    return this._name;
  }

  get position(): Position {
    return this._position;
  }

  get agility(): number {
    return this._agility;
  }

  get age(): number {
    return this._age;
  }

  get condition(): Condition {
    return this._condition;
  }

  get baseValue(): Money {
    return this._baseValue;
  }

  get potential(): number {
    return this._potential;
  }

  get clubId(): number | null {
    return this._clubId;
  }

  get excluded(): boolean {
    return this._excluded;
  }

  get pace(): number {
    return this.skills.pace;
  }

  get shooting(): number {
    return this.skills.shooting;
  }

  get passing(): number {
    return this.skills.passing;
  }

  get dribbling(): number {
    return this.skills.dribbling;
  }

  get defending(): number {
    return this.skills.defending;
  }

  get physical(): number {
    return this.skills.physical;
  }

  get overall(): number {
    return overallOf(this._position, this.skills);
  }

  get marketValue(): Money {
    return marketValueOf(
      this._baseValue,
      this._condition,
      this._agility,
      this._age,
    );
  }
}

function assertRegistration(input: RegisterPlayer): void {
  const values = [
    input.pace,
    input.shooting,
    input.passing,
    input.dribbling,
    input.defending,
    input.physical,
  ];
  const best = Math.max(...values);
  if (values.reduce((sum, skill) => sum + skill, 0) > 480) {
    throw new DomainError(
      'invalid',
      'A soma dos indicadores não pode passar de 480',
    );
  }
  if (input.potential < best) {
    throw new DomainError(
      'invalid',
      'O potencial não pode ser menor que o maior indicador',
    );
  }
  if (input.age >= 33 && input.potential !== best) {
    throw new DomainError(
      'invalid',
      'A partir dos 33 anos o potencial é igual ao maior indicador',
    );
  }
  assertAgility(input.age, input.agility);
}

function assertAgility(age: number, agility: number): void {
  if (age >= 35 && agility > 85) {
    throw new DomainError(
      'invalid',
      'A partir dos 35 anos a agilidade máxima é 85',
    );
  }
}

function skillsOf(input: PlayerSkills): PlayerSkills {
  return {
    pace: input.pace,
    shooting: input.shooting,
    passing: input.passing,
    dribbling: input.dribbling,
    defending: input.defending,
    physical: input.physical,
  };
}

import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  POSITIONS,
  type Position,
} from '../../../domain/entities/player-types.js';
import { codePointLength } from '../player-text.js';

@ValidatorConstraint({ name: 'playerName' })
export class PlayerNameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    if (hasControlCharacter(value)) {
      return false;
    }
    if (/[0-9]/.test(value)) {
      return false;
    }

    const length = codePointLength(value);
    if (length < 3 || length > 100) {
      return false;
    }

    const words = value.split(' ');
    return (
      words.length >= 2 &&
      words.every((word) => word.length > 0 && /\p{L}/u.test(word))
    );
  }

  defaultMessage(): string {
    return 'Nome inválido';
  }
}

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

export function normalizeName(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
}

export class CreatePlayerDto {
  @Transform(({ value }) => normalizeName(value))
  @IsString()
  @IsNotEmpty()
  @Validate(PlayerNameConstraint)
  name: string;

  @IsIn(POSITIONS)
  position: Position;

  @IsInt()
  @Min(1)
  @Max(100)
  agility: number;

  @IsInt()
  @Min(16)
  @Max(45)
  age: number;

  @IsInt()
  @Min(1)
  @Max(99)
  pace: number;

  @IsInt()
  @Min(1)
  @Max(99)
  shooting: number;

  @IsInt()
  @Min(1)
  @Max(99)
  passing: number;

  @IsInt()
  @Min(1)
  @Max(99)
  dribbling: number;

  @IsInt()
  @Min(1)
  @Max(99)
  defending: number;

  @IsInt()
  @Min(1)
  @Max(99)
  physical: number;

  @IsInt()
  @Min(1)
  @Max(99)
  potential: number;
}

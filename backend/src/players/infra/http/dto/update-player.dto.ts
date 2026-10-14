import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import {
  POSITIONS,
  type Position,
} from '../../../domain/types/player-types.js';
import { normalizeName, PlayerNameConstraint } from './create-player.dto.js';

export class UpdatePlayerDto {
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
}

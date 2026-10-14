import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { posicao } from '../../generated/prisma/client.js';
import { normalizeName, PlayerNameConstraint } from './create-player.dto.js';

export class UpdatePlayerDto {
  @Transform(({ value }) => normalizeName(value))
  @IsString()
  @IsNotEmpty()
  @Validate(PlayerNameConstraint)
  name: string;

  @IsEnum(posicao)
  position: posicao;

  @IsInt()
  @Min(1)
  @Max(100)
  agility: number;

  @IsInt()
  @Min(16)
  @Max(45)
  age: number;
}

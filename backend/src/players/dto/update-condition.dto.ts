import { IsEnum } from 'class-validator';
import { condicao } from '../../generated/prisma/client.js';

export class UpdateConditionDto {
  @IsEnum(condicao)
  condition: condicao;
}

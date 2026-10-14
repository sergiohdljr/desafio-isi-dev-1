import { IsIn } from 'class-validator';
import { CONDITIONS, type Condition } from '../../../domain/player-types.js';

export class UpdateConditionDto {
  @IsIn(CONDITIONS)
  condition: Condition;
}

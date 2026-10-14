import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { clubIdSchema } from '../../../clubs/infra/http/input/club-id.schema.js';
import {
  FIND_LINEUP,
  SET_LINEUP,
  type FindLineupPort,
  type SetLineupPort,
} from '../../application/use-cases/lineup.use-case.js';
import { lineupSchema, type LineupBody } from './dto/lineup.schema.js';
import { presentLineup } from './presenters/league-response.js';

@Controller('clubs')
export class LineupController {
  constructor(
    @Inject(FIND_LINEUP) private readonly findLineup: FindLineupPort,
    @Inject(SET_LINEUP) private readonly setLineup: SetLineupPort,
  ) {}

  @Get(':id/lineup')
  async show(
    @Param('id', new ZodPipe(clubIdSchema, 'not_found', 'Clube não encontrado'))
    id: number,
  ) {
    return presentLineup(await this.findLineup.execute(id));
  }

  @Put(':id/lineup')
  async replace(
    @Param('id', new ZodPipe(clubIdSchema, 'not_found', 'Clube não encontrado'))
    id: number,
    @Body(new ZodPipe(lineupSchema)) body: LineupBody,
  ) {
    return presentLineup(await this.setLineup.execute(id, body));
  }
}

import { Injectable, PipeTransform } from '@nestjs/common';
import { PlayerListQuery } from '../../use-cases/player-list-query.js';
import { parsePlayerListQuery } from './parse-player-list-query.js';

@Injectable()
export class ListPlayersQueryPipe implements PipeTransform<
  unknown,
  PlayerListQuery
> {
  transform(value: unknown): PlayerListQuery {
    return parsePlayerListQuery(value);
  }
}

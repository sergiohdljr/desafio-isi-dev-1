import { Injectable, PipeTransform } from '@nestjs/common';
import { parsePlayerListQuery, PlayerListQuery } from './player-list-query.js';

@Injectable()
export class ListPlayersQueryPipe implements PipeTransform<
  unknown,
  PlayerListQuery
> {
  transform(value: unknown): PlayerListQuery {
    return parsePlayerListQuery(value);
  }
}

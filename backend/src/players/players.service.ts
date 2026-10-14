import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { condicao } from '../generated/prisma/client.js';
import { baseValueOf, overallOf } from './player-valuation.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { listPlayers, type PlayerListResponse } from './player-list.js';
import type { PlayerListQuery } from './player-list-query.js';
import { PlayerResponse, toPlayerResponse } from './player-response.js';
import { PlayersRepository } from './players.repository.js';

@Injectable()
export class PlayersService {
  constructor(private readonly players: PlayersRepository) {}

  async create(player: CreatePlayerDto): Promise<PlayerResponse> {
    this.assertRegistrationRules(player);

    const skills = {
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defending: player.defending,
      physical: player.physical,
    };
    const overall = overallOf(player.position, skills);
    const baseValue = baseValueOf(overall, player.potential, player.age);
    const created = await this.players.create(player, baseValue);

    return toPlayerResponse(created);
  }

  async findOne(id: number): Promise<PlayerResponse> {
    return toPlayerResponse(await this.requireActive(id));
  }

  async findAll(query: PlayerListQuery): Promise<PlayerListResponse> {
    if (query.clubId !== undefined) {
      const club = await this.players.clubExists(query.clubId);
      if (!club) {
        throw new NotFoundException('Clube não encontrado');
      }
    }

    const players = await this.players.findActive();
    return listPlayers(players.map(toPlayerResponse), query);
  }

  async update(id: number, input: UpdatePlayerDto): Promise<PlayerResponse> {
    const player = await this.requireActive(id);
    if (input.age < player.idade) {
      throw new ConflictException('A idade não pode ser menor que a atual');
    }
    if (player.clube_id !== null && input.position !== player.posicao) {
      throw new ConflictException('Jogador com clube não muda de posição');
    }
    if (input.age >= 35 && input.agility > 85) {
      throw new BadRequestException(
        'A partir dos 35 anos a agilidade máxima é 85',
      );
    }

    const updated = await this.players.update(id, input);
    return toPlayerResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const player = await this.requireActive(id);
    if (player.clube_id !== null) {
      throw new ConflictException('Jogador de um clube não pode ser excluído');
    }

    await this.players.markDeleted(id);
  }

  async updateCondition(
    id: number,
    condition: condicao,
  ): Promise<PlayerResponse> {
    const player = await this.requireActive(id);
    if (player.condicao === condicao.DOENTE && condition === condicao.APTO) {
      throw new ConflictException(
        'Um jogador doente não passa direto para apto',
      );
    }
    if (player.condicao === condition) {
      return toPlayerResponse(player);
    }

    const updated = await this.players.updateCondition(id, condition);
    return toPlayerResponse(updated);
  }

  private async requireActive(id: number) {
    const player = await this.players.findActiveById(id);
    if (!player) {
      throw new NotFoundException('Jogador não encontrado');
    }

    return player;
  }

  private assertRegistrationRules(player: CreatePlayerDto): void {
    const skills = [
      player.pace,
      player.shooting,
      player.passing,
      player.dribbling,
      player.defending,
      player.physical,
    ];
    const best = Math.max(...skills);

    if (skills.reduce((sum, skill) => sum + skill, 0) > 480) {
      throw new BadRequestException(
        'A soma dos indicadores não pode passar de 480',
      );
    }
    if (player.potential < best) {
      throw new BadRequestException(
        'O potencial não pode ser menor que o maior indicador',
      );
    }
    if (player.age >= 33 && player.potential !== best) {
      throw new BadRequestException(
        'A partir dos 33 anos o potencial é igual ao maior indicador',
      );
    }
    if (player.age >= 35 && player.agility > 85) {
      throw new BadRequestException(
        'A partir dos 35 anos a agilidade máxima é 85',
      );
    }
  }
}

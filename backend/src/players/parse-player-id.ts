import { NotFoundException } from '@nestjs/common';

const MAX_INT32 = 2_147_483_647;

export function parsePlayerId(value: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new NotFoundException('Jogador não encontrado');
  }

  const id = Number(value);
  if (id > MAX_INT32) {
    throw new NotFoundException('Jogador não encontrado');
  }

  return id;
}

import { Prisma } from '../../../../generated/prisma/client.js';

export async function releaseLineupSeat(
  tx: Prisma.TransactionClient,
  playerId: number,
): Promise<void> {
  await tx.escalacoes.deleteMany({ where: { jogador_id: playerId } });
}

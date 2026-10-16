import type { PrismaService } from '../src/prisma/prisma.service.js';

export async function emptyLeague(prisma: PrismaService): Promise<void> {
  await prisma.duelos_partida.deleteMany();
  await prisma.partidas.deleteMany();
  await prisma.escalacoes.deleteMany();
  await prisma.transacoes.deleteMany();
  await prisma.contratos.deleteMany();
  await prisma.jogadores.deleteMany();
  await prisma.clubes.deleteMany();
}

import { NestFactory } from '@nestjs/core';
import { loadHostEnv } from '../config/load-host-env.js';
import { PrismaService } from '../prisma/prisma.service.js';

async function cleanDatabase() {
  loadHostEnv();
  const { AppModule } = await import('../app.module.js');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const prisma = app.get(PrismaService);
    await prisma.$transaction([
      prisma.duelos_partida.deleteMany(),
      prisma.partidas.deleteMany(),
      prisma.escalacoes.deleteMany(),
      prisma.transacoes.deleteMany(),
      prisma.contratos.deleteMany(),
      prisma.jogadores.deleteMany(),
      prisma.clubes.deleteMany(),
    ]);
    console.log('Banco limpo.');
  } finally {
    await app.close();
  }
}

cleanDatabase().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Falha ao limpar o banco';
  console.error(message);
  process.exitCode = 1;
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CREATE_CLUB,
  type CreateClubPort,
} from '../modules/clubs/application/use-cases/create-club.use-case.js';
import {
  CREATE_PLAYER,
  type CreatePlayerPort,
} from '../modules/players/application/use-cases/create-player.use-case.js';
import {
  BUY_PLAYER,
  type BuyPlayerPort,
} from '../modules/market/application/use-cases/buy-player.use-case.js';
import { SQUAD_LIMIT } from '../modules/market/application/policies/decide-purchase.js';
import type { Position } from '../modules/players/domain/types/player-types.js';

const LOYALTY_DAYS = 365
const FREE_PLAYERS = 12
const SKILL = 1
const AGE = 24
const AGILITY = 40

const SQUAD: Position[] = [
  'GOL',
  'GOL',
  'ZAG',
  'ZAG',
  'LAT',
  'LAT',
  'MEI',
  'MEI',
  'MEI',
  'ATA',
  'ATA',
  'ATA',
]

const CLUBS = [
  { name: 'Norte Futebol Clube', acronym: 'NFC' },
  { name: 'Sul Esporte Clube', acronym: 'SEC' },
] as const

const FIRST_NAMES = ['Caio', 'Davi', 'Enzo', 'Iago', 'Luan', 'Otto']
const LAST_NAMES = ['Melo', 'Lima', 'Nunes', 'Pires', 'Rocha', 'Souza']

async function resetDemo() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  try {
    const prisma = app.get(PrismaService)
    const createClub = app.get<CreateClubPort>(CREATE_CLUB)
    const createPlayer = app.get<CreatePlayerPort>(CREATE_PLAYER)
    const buyPlayer = app.get<BuyPlayerPort>(BUY_PLAYER)

    await prisma.$transaction([
      prisma.duelos_partida.deleteMany(),
      prisma.partidas.deleteMany(),
      prisma.escalacoes.deleteMany(),
      prisma.transacoes.deleteMany(),
      prisma.contratos.deleteMany(),
      prisma.jogadores.deleteMany(),
      prisma.clubes.deleteMany(),
    ])

    const loyaltyUntil = new Date()
    loyaltyUntil.setUTCDate(loyaltyUntil.getUTCDate() + LOYALTY_DAYS)

    let nameIndex = 0
    for (const club of CLUBS) {
      const created = await createClub.execute(club)
      for (const position of SQUAD) {
        const player = await createPlayer.execute(draft(position, nameIndex))
        nameIndex += 1
        await buyPlayer.execute({
          playerId: player.id,
          clubId: created.id,
          loyaltyUntil,
        })
      }
    }

    for (let index = 0; index < FREE_PLAYERS; index += 1) {
      await createPlayer.execute(draft(SQUAD[index % SQUAD.length], nameIndex))
      nameIndex += 1
    }

    console.log(
      `Banco limpo. ${CLUBS.length} clubes com ${SQUAD_LIMIT} jogadores cada e ${FREE_PLAYERS} jogadores sem contrato.`,
    )
  } finally {
    await app.close()
  }
}

function draft(position: Position, index: number) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]
  return {
    name: `${first} ${last}`,
    position,
    agility: AGILITY,
    age: AGE,
    pace: SKILL,
    shooting: SKILL,
    passing: SKILL,
    dribbling: SKILL,
    defending: SKILL,
    physical: SKILL,
    potential: SKILL,
  }
}

resetDemo().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Falha ao remontar o banco'
  console.error(message)
  process.exitCode = 1
})

import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

const meia = {
  position: 'MEI' as const,
  agility: 50,
  age: 25,
  pace: 70,
  shooting: 70,
  passing: 80,
  dribbling: 80,
  defending: 50,
  physical: 70,
  potential: 86,
};

describe('Market sale', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    app.useLogger(false);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    await emptyLeague(app.get(PrismaService));
  });

  afterAll(async () => {
    await app.close();
  });

  it('sells a player whose loyalty is over, credits the cash and frees him', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Águias FC', 'AFC');
    const playerId = await createPlayer('Meia Lua', '25.00');
    await buy(playerId, clubId);

    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .send({ club_id: 1 })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toMatchObject({
      club_id: clubId,
      player_id: playerId,
      player_name: 'Meia Lua',
      type: 'VENDA',
      value: 25,
      fee: 0,
      penalty: 0,
      profit: 0,
      cash_change: 25,
      purchase_value: 25,
      remaining_days: 0,
      penalty_rate: 0,
      contract_status: 'ENCERRADO',
      club_cash: 300,
    });
    expect(response.body.created_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
    );

    const player = await request(app.getHttpServer())
      .get(`/api/v1/players/${playerId}`)
      .expect(200);
    expect(player.body.club_id).toBeNull();
    const club = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    expect(club.body.players).toEqual([]);
    expect(club.body.cash).toBe(300);
    expect(club.body.squad_value).toBe(0);
    expect(club.body.net_worth).toBe(300);
  });

  it('rounds the commission once when the sale has profit and no penalty', async () => {
    const clubId = await createClub('Búfalos FC', 'BFC');
    const playerId = await createPlayer('Meia Lucro', '10.00');
    await buy(playerId, clubId);
    await app.get(PrismaService).jogadores.update({
      where: { id: playerId },
      data: { valor_base: '13.85' },
    });
    await app.get(PrismaService).contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);

    expect(response.body).toMatchObject({
      value: 13.85,
      purchase_value: 10,
      profit: 3.85,
      fee: 0.39,
      penalty: 0,
      penalty_rate: 0,
      remaining_days: 0,
      cash_change: 13.46,
      contract_status: 'ENCERRADO',
      club_cash: 303.46,
    });
  });

  it('refuses to sell a free player and does not record the sale', async () => {
    const prisma = app.get(PrismaService);
    const playerId = await createPlayer('Meia Solta', '25.00');
    const before = await prisma.transacoes.count();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(409);
    expect(response.body.message.length).toBeGreaterThan(0);
    expect(await prisma.transacoes.count()).toBe(before);

    await request(app.getHttpServer())
      .delete(`/api/v1/players/${playerId}`)
      .expect(204);
    const missing = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(404);
    expect(missing.body.message.length).toBeGreaterThan(0);
    await request(app.getHttpServer())
      .post('/api/v1/players/01/sell')
      .expect(404);
  });

  async function createClub(name: string, acronym: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return response.body.id;
  }

  async function createPlayer(name: string, base: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meia, name })
      .expect(201);
    await app.get(PrismaService).jogadores.update({
      where: { id: response.body.id },
      data: { valor_base: base },
    });
    return response.body.id;
  }

  async function buy(playerId: number, clubId: number) {
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);
  }
});

async function emptyLeague(prisma: PrismaService): Promise<void> {
  await prisma.duelos_partida.deleteMany();
  await prisma.partidas.deleteMany();
  await prisma.escalacoes.deleteMany();
  await prisma.transacoes.deleteMany();
  await prisma.contratos.deleteMany();
  await prisma.jogadores.deleteMany();
  await prisma.clubes.deleteMany();
}

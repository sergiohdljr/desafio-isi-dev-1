import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { emptyLeague } from './empty-league.js';

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

describe('Market history', () => {
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

  it('returns an empty history and a zero summary for a club without deals', async () => {
    const clubId = await createClub('Vazio FC', 'VFC');
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual({
      data: [],
      summary: {
        total_spent: 0,
        total_received: 0,
        total_fees: 0,
        total_penalties: 0,
        total_profit: 0,
      },
    });
  });

  it('lists the newest deal first and keeps the stored name and the cash identity', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Águias FC', 'AFC');
    const playerId = await createPlayer('Meia Lua', '40.00');
    await buy(playerId, clubId);
    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);
    await request(app.getHttpServer())
      .put(`/api/v1/players/${playerId}`)
      .send({ name: 'Ana Lima', position: 'MEI', agility: 50, age: 25 })
      .expect(200);
    await prisma.jogadores.update({
      where: { id: playerId },
      data: { valor_base: '80.00' },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .expect(200);
    expect(response.body.data.map((row: { type: string }) => row.type)).toEqual(
      ['VENDA', 'COMPRA'],
    );
    expect(response.body.data[1]).toMatchObject({
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 40,
      fee: 2,
      penalty: 0,
      profit: null,
      cash_change: -42,
    });
    expect(response.body.data[0]).toMatchObject({
      player_name: 'Meia Lua',
      type: 'VENDA',
      value: 40,
      fee: 0,
      penalty: 0,
      profit: 0,
      cash_change: 40,
    });
    expect(response.body.summary).toEqual({
      total_spent: 42,
      total_received: 40,
      total_fees: 2,
      total_penalties: 0,
      total_profit: 0,
    });

    const club = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    const cashChange = response.body.data.reduce(
      (sum: number, row: { cash_change: number }) => sum + row.cash_change,
      0,
    );
    expect(club.body.cash).toBe(300 + cashChange);
  });

  it('breaks a timestamp tie by descending id', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Empate FC', 'EFC');
    const first = await createPlayer('Primeiro Alfa', '1.00');
    const second = await createPlayer('Segundo Beta', '1.00');
    await buy(first, clubId);
    await buy(second, clubId);
    const sameInstant = new Date('2026-11-02T13:15:00.000Z');
    await prisma.transacoes.updateMany({
      where: { clube_id: clubId },
      data: { criado_em: sameInstant },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .expect(200);
    const ids = response.body.data.map((row: { id: number }) => row.id);
    expect(ids).toEqual([...ids].sort((left, right) => right - left));
    expect(response.body.data[0].player_name).toBe('Segundo Beta');
  });

  it('answers 404 for a missing club', async () => {
    const missing = await request(app.getHttpServer())
      .get('/api/v1/clubs/999999/transactions')
      .expect(404);
    expect(missing.body.message.length).toBeGreaterThan(0);
    await request(app.getHttpServer())
      .get('/api/v1/clubs/01/transactions')
      .expect(404);
  });

  it('filters the history by type and player and keeps the summary on that subset', async () => {
    const clubId = await createClub('Filtro FC', 'FFC');
    const traded = await createPlayer('Meia Filtro', '40.00');
    const outsider = await createPlayer('Meia Fora', '10.00');
    await buy(traded, clubId);
    await app.get(PrismaService).contratos.updateMany({
      where: { jogador_id: traded, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${traded}/sell`)
      .expect(200);

    const sales = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ type: 'VENDA', extra: '1' })
      .expect(200);
    expect(sales.body.data).toHaveLength(1);
    expect(sales.body.data[0].type).toBe('VENDA');
    expect(sales.body.summary.total_spent).toBe(0);

    const purchases = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ type: 'COMPRA' })
      .expect(200);
    expect(purchases.body.summary).toMatchObject({
      total_received: 0,
      total_penalties: 0,
      total_profit: 0,
    });
    expect(purchases.body.data[0].type).toBe('COMPRA');

    const both = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ type: 'COMPRA,VENDA', player_id: String(traded) })
      .expect(200);
    expect(both.body.data).toHaveLength(2);

    const empty = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ player_id: String(outsider) })
      .expect(200);
    expect(empty.body.data).toEqual([]);
    expect(empty.body.summary).toEqual({
      total_spent: 0,
      total_received: 0,
      total_fees: 0,
      total_penalties: 0,
      total_profit: 0,
    });
  });

  it('rejects a bad history filter and a missing player', async () => {
    const clubId = await createClub('Recusa FC', 'RFC');
    for (const query of [
      { type: '' },
      { type: 'venda' },
      { type: 'COMPRA,COMPRA' },
      { type: 'COMPRA, VENDA' },
      { player_id: '01' },
      { player_id: '0' },
    ]) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clubs/${clubId}/transactions`)
        .query(query)
        .expect(400);
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    }

    const missing = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ player_id: '999999' })
      .expect(404);
    expect(missing.body.message.length).toBeGreaterThan(0);

    const gone = await createPlayer('Meia Some', '10.00');
    await request(app.getHttpServer())
      .delete(`/api/v1/players/${gone}`)
      .expect(204);
    await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions`)
      .query({ player_id: String(gone) })
      .expect(404);

    const unknownClub = await request(app.getHttpServer())
      .get('/api/v1/clubs/999999/transactions')
      .query({ type: 'VENDA' })
      .expect(404);
    expect(unknownClub.body.message.length).toBeGreaterThan(0);
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

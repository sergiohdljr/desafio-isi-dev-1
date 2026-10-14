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

  it('refuses a rebuy by the selling club and lets another club buy', async () => {
    const prisma = app.get(PrismaService);
    const sellerId = await createClub('Vendedor FC', 'VFC');
    const buyerId = await createClub('Comprador FC', 'CFC');
    const thirdId = await createClub('Terceiro FC', 'TFC');
    const playerId = await createPlayer('Meia Volta', '25.00');
    await buy(playerId, sellerId);
    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);
    const before = await prisma.transacoes.count();
    const seller = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${sellerId}`)
      .expect(200);

    const refused = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send({ club_id: sellerId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(409);
    expect(refused.body.message.length).toBeGreaterThan(0);
    expect(await prisma.transacoes.count()).toBe(before);
    const stillFree = await request(app.getHttpServer())
      .get(`/api/v1/players/${playerId}`)
      .expect(200);
    expect(stillFree.body.club_id).toBeNull();
    const sellerAfter = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${sellerId}`)
      .expect(200);
    expect(sellerAfter.body.cash).toBe(seller.body.cash);

    const accepted = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send({ club_id: buyerId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);
    expect(accepted.body.club_id).toBe(buyerId);
    expect(accepted.body.type).toBe('COMPRA');

    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date('2020-01-01T03:00:00.000Z') },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);
    const third = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send({ club_id: thirdId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);
    expect(third.body.club_id).toBe(thirdId);
  });

  it('rounds remaining loyalty up into the penalty band', async () => {
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    const bands: Array<[string, string, number, number, number]> = [
      ['Faixa Onze', 'FON', 10 * day + 2 * hour, 11, 5],
      ['Faixa Trinta', 'FTR', 30 * day, 30, 5],
      ['Minuto Trinta', 'MTR', 30 * day + minute, 31, 10],
      ['Faixa Cheia', 'FCH', 180 * day, 180, 10],
      ['Minuto Cheio', 'MCH', 180 * day + minute, 181, 20],
      ['Faixa Longa', 'FLO', 200 * day, 200, 20],
    ];

    for (const [name, acronym, offset, days, rate] of bands) {
      const sold = await sellAfter({
        name,
        acronym,
        bought: '40.00',
        sold: '40.00',
        loyaltyMs: offset,
      });
      expect(sold.remaining_days).toBe(days);
      expect(sold.penalty_rate).toBe(rate);
      expect(sold.contract_status).toBe('RESCINDIDO');
    }
  });

  it('caps the penalty at 10 and credits the worked sales', async () => {
    const day = 24 * 60 * 60 * 1000;
    expect(
      await sellAfter({
        name: 'Meia Multa',
        acronym: 'MMF',
        bought: '37.00',
        sold: '40.00',
        loyaltyMs: 31 * day,
      }),
    ).toMatchObject({
      value: 40,
      purchase_value: 37,
      penalty: 4,
      penalty_rate: 10,
      profit: 3,
      fee: 0.3,
      cash_change: 35.7,
      contract_status: 'RESCINDIDO',
    });
    expect(
      await sellAfter({
        name: 'Meia Perda',
        acronym: 'MPF',
        bought: '50.00',
        sold: '42.50',
        loyaltyMs: 181 * day,
      }),
    ).toMatchObject({
      value: 42.5,
      purchase_value: 50,
      penalty: 8.5,
      penalty_rate: 20,
      profit: -7.5,
      fee: 0,
      cash_change: 34,
      contract_status: 'RESCINDIDO',
    });
    expect(
      await sellAfter({
        name: 'Meia Curta',
        acronym: 'MCF',
        bought: '26.15',
        sold: '30.00',
        loyaltyMs: 11 * day,
      }),
    ).toMatchObject({
      value: 30,
      purchase_value: 26.15,
      penalty: 1.5,
      penalty_rate: 5,
      profit: 3.85,
      fee: 0.39,
      cash_change: 28.11,
      contract_status: 'RESCINDIDO',
    });
    expect(
      await sellAfter({
        name: 'Meia Teto',
        acronym: 'MTF',
        bought: '60.00',
        sold: '75.00',
        loyaltyMs: 200 * day,
      }),
    ).toMatchObject({
      value: 75,
      purchase_value: 60,
      penalty: 10,
      penalty_rate: 20,
      profit: 15,
      fee: 2,
      cash_change: 63,
      contract_status: 'RESCINDIDO',
    });
  });

  async function sellAfter(input: {
    name: string;
    acronym: string;
    bought: string;
    sold: string;
    loyaltyMs: number;
  }) {
    const clubId = await createClub(`${input.name} FC`, input.acronym);
    const playerId = await createPlayer(input.name, input.bought);
    await buy(playerId, clubId);
    const prisma = app.get(PrismaService);
    await prisma.jogadores.update({
      where: { id: playerId },
      data: { valor_base: input.sold },
    });
    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: { fidelidade_ate: new Date(Date.now() + input.loyaltyMs) },
    });
    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);
    return response.body;
  }

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

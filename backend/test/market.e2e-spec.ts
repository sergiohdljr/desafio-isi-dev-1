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
  name: 'Meia Lua',
  position: 'MEI',
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

describe('Market purchase', () => {
  let app: NestFastifyApplication;
  let serial = 0;

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

  it('buys a free player at market value, opens the contract and debits the cash', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Águias FC', 'AFC');
    const player = await createPlayer('Meia Lua');
    expect(player.market_value).toBe(40);
    expect(player.base_value).toBe(40);

    const before = await prisma.transacoes.count();
    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({
        club_id: clubId,
        loyalty_until: '2027-06-15T10:15-03:00',
        cash: 1,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toMatchObject({
      club_id: clubId,
      player_id: player.id,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 40,
      fee: 2,
      penalty: 0,
      profit: null,
      cash_change: -42,
      contract: {
        purchase_value: 40,
        loyalty_until: '2027-06-15T10:15:00-03:00',
        status: 'ATIVO',
      },
      club_cash: 258,
    });
    expect(response.body.created_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
    );
    expect(await prisma.transacoes.count()).toBe(before + 1);

    const club = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    expect(club.body.cash).toBe(258);
    expect(club.body.squad_value).toBe(40);
    expect(club.body.net_worth).toBe(298);
    expect(club.body.players).toEqual([
      expect.objectContaining({
        id: player.id,
        club_id: clubId,
        contract: expect.objectContaining({
          purchase_value: 40,
          loyalty_until: '2027-06-15T10:15:00-03:00',
        }),
      }),
    ]);

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(fetched.body.club_id).toBe(clubId);
  });

  it('charges the fee from the worked examples, including a cost equal to half the cash', async () => {
    await expectPurchase({
      market: '28.00',
      cash: '300.00',
      fee: 0,
      cost: 28,
      left: 272,
    });
    await expectPurchase({
      market: '30.00',
      cash: '300.00',
      fee: 0,
      cost: 30,
      left: 270,
    });
    await expectPurchase({
      market: '30.01',
      cash: '300.00',
      fee: 1.5,
      cost: 31.51,
      left: 268.49,
    });
    await expectPurchase({
      market: '47.62',
      cash: '100.00',
      fee: 2.38,
      cost: 50,
      left: 50,
    });
  });

  it('buys at the discounted market value, not the base value', async () => {
    const clubId = await createClub('Búfalos FC', 'BFC');
    const player = await createPlayer('Meia Baixa');
    const conditioned = await request(app.getHttpServer())
      .patch(`/api/v1/players/${player.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    expect(conditioned.body.base_value).toBe(40);
    expect(conditioned.body.market_value).toBe(34);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);

    expect(response.body.value).toBe(34);
    expect(response.body.fee).toBe(1.7);
    expect(response.body.cash_change).toBe(-35.7);
    expect(response.body.contract.purchase_value).toBe(34);
    expect(response.body.club_cash).toBe(264.3);
  });

  it('rejects an invalid purchase and does not record it', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Cervos FC', 'CFC');
    const player = await createPlayer('Meia Certa');
    const before = await prisma.transacoes.count();
    const contracts = await prisma.contratos.count();

    for (const body of [
      { loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: clubId },
      { club_id: null, loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: 0, loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: -1, loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: 1.5, loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: '1', loyalty_until: '2027-06-15T10:15-03:00' },
      { club_id: clubId, loyalty_until: '2027-06-15T10:15:00-03:00' },
      { club_id: clubId, loyalty_until: '2027-02-30T10:15-03:00' },
      { club_id: clubId, loyalty_until: '2027-06-15T24:00-03:00' },
      { club_id: clubId, loyalty_until: '2020-01-01T10:15-03:00' },
      { club_id: clubId, loyalty_until: '2030-01-01T10:15-03:00' },
      [],
    ]) {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/players/${player.id}/buy`)
        .send(body)
        .expect(400);
      expect(response.body.message.length).toBeGreaterThan(0);
    }

    for (const raw of ['10', '"x"']) {
      await request(app.getHttpServer())
        .post(`/api/v1/players/${player.id}/buy`)
        .set('Content-Type', 'application/json')
        .send(raw)
        .expect(400);
    }

    expect(await prisma.transacoes.count()).toBe(before);
    expect(await prisma.contratos.count()).toBe(contracts);
    const stillFree = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(stillFree.body.club_id).toBeNull();
  });

  it('answers 404 for a missing player or club and does not record the purchase', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Dourados FC', 'DFC');
    const player = await createPlayer('Meia some');
    await request(app.getHttpServer())
      .delete(`/api/v1/players/${player.id}`)
      .expect(204);
    const before = await prisma.transacoes.count();
    const loyalty = { loyalty_until: '2027-06-15T10:15-03:00' };

    for (const [url, body] of [
      [`/api/v1/players/${player.id}/buy`, { club_id: clubId, ...loyalty }],
      ['/api/v1/players/999999/buy', { club_id: clubId, ...loyalty }],
      ['/api/v1/players/01/buy', { club_id: clubId, ...loyalty }],
      [
        `/api/v1/players/${(await createPlayer('Meia Livre')).id}/buy`,
        { club_id: 999999, ...loyalty },
      ],
    ] as const) {
      const response = await request(app.getHttpServer())
        .post(url)
        .send(body)
        .expect(404);
      expect(response.body.message.length).toBeGreaterThan(0);
    }

    expect(await prisma.transacoes.count()).toBe(before);
  });

  it('refuses a player who already has a club and leaves both clubs untouched', async () => {
    const prisma = app.get(PrismaService);
    const homeId = await createClub('Casa Alta', 'CAA');
    const awayId = await createClub('Fora Alta', 'FAA');
    const player = await createPlayer('Meia Presa');
    await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: homeId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);
    const before = await prisma.transacoes.count();
    const awayBefore = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${awayId}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: awayId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(409);
    expect(response.body.message.length).toBeGreaterThan(0);

    expect(await prisma.transacoes.count()).toBe(before);
    const away = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${awayId}`)
      .expect(200);
    expect(away.body.cash).toBe(awayBefore.body.cash);
    expect(away.body.players).toEqual([]);
    const stillHome = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(stillHome.body.club_id).toBe(homeId);
  });

  it('accepts the 12th player and refuses the 13th without recording it', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Elenco Cheio', 'ELC');
    const names = [
      'Reserva Alfa',
      'Reserva Beta',
      'Reserva Gama',
      'Reserva Delta',
      'Reserva Zeta',
      'Reserva Eta',
      'Reserva Teta',
      'Reserva Iota',
      'Reserva Kapa',
      'Reserva Lambda',
      'Reserva Mu',
      'Reserva Ni',
      'Reserva Xi',
    ];
    for (const [index, name] of names.entries()) {
      const player = await createPlayer(name);
      await prisma.jogadores.update({
        where: { id: player.id },
        data: { valor_base: '1.00' },
      });
      const response = await request(app.getHttpServer())
        .post(`/api/v1/players/${player.id}/buy`)
        .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' });
      expect(response.status).toBe(index < 12 ? 200 : 409);
    }

    const club = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    expect(club.body.players).toHaveLength(12);
    expect(club.body.cash).toBe(288);
    const leftOut = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: 'Reserva Xi' })
      .expect(200);
    expect(leftOut.body.data[0].club_id).toBeNull();
  });

  it('refuses a cost above half the cash, including an unrounded half', async () => {
    await expectRefusal({ market: '48.00', cash: '100.00' });
    await expectRefusal({ market: '124.36', cash: '261.15' });
  });

  async function createClub(name: string, acronym: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return response.body.id;
  }

  async function createPlayer(name: string) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meia, name })
      .expect(201);
    return response.body as {
      id: number;
      market_value: number;
      base_value: number;
    };
  }

  async function expectPurchase(input: {
    market: string;
    cash: string;
    fee: number;
    cost: number;
    left: number;
  }) {
    const prisma = app.get(PrismaService);
    serial += 1;
    const letter = String.fromCharCode(64 + serial);
    const clubId = await createClub(`Mercado ${letter} Norte`, `M${letter}N`);
    const player = await createPlayer(`Jogador ${letter} Alfa`);
    await prisma.jogadores.update({
      where: { id: player.id },
      data: { valor_base: input.market },
    });
    await prisma.clubes.update({
      where: { id: clubId },
      data: { caixa: input.cash },
    });

    const priced = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(priced.body.market_value).toBe(Number(input.market));

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);

    expect(response.body.value).toBe(Number(input.market));
    expect(response.body.fee).toBe(input.fee);
    expect(response.body.cash_change).toBe(-input.cost);
    expect(response.body.club_cash).toBe(input.left);
  }

  async function expectRefusal(input: { market: string; cash: string }) {
    const prisma = app.get(PrismaService);
    serial += 1;
    const letter = String.fromCharCode(64 + serial);
    const clubId = await createClub(`Recusa ${letter} Norte`, `R${letter}N`);
    const player = await createPlayer(`Recusa ${letter} Alfa`);
    await prisma.jogadores.update({
      where: { id: player.id },
      data: { valor_base: input.market },
    });
    await prisma.clubes.update({
      where: { id: clubId },
      data: { caixa: input.cash },
    });
    const before = await prisma.transacoes.count();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(409);
    expect(response.body.message.length).toBeGreaterThan(0);
    expect(await prisma.transacoes.count()).toBe(before);

    const club = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    expect(club.body.cash).toBe(Number(input.cash));
    expect(club.body.players).toEqual([]);
    const free = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(free.body.club_id).toBeNull();
  }
});

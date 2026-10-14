import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function clubPayload(index: number): { name: string; acronym: string } {
  const first = alphabet[Math.floor(index / 26)] ?? 'A';
  const second = alphabet[index % 26] ?? 'A';
  return {
    name: `Clube ${first}${second}Q`,
    acronym: `C${first}${second}`,
  };
}

describe('Clubs', () => {
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

  it('registers a club with 300 cash and reads it back with an empty squad', async () => {
    const prisma = app.get(PrismaService);
    const before = await prisma.clubes.count();
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({
        name: '  Águias   FC ',
        acronym: 'AFC',
        cash: 10,
        id: 9,
        extra: true,
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.headers.location).toBe(`/api/v1/clubs/${response.body.id}`);
    expect(response.body).toEqual({
      id: response.body.id,
      name: 'Águias FC',
      acronym: 'AFC',
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    });
    expect(typeof response.body.cash).toBe('number');

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${response.body.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(fetched.body).toEqual({ ...response.body, players: [] });
    expect(await prisma.clubes.count()).toBe(before + 1);
  });

  it('refuses a case-only duplicate, accepts an accent difference, and enforces that in the database', async () => {
    const prisma = app.get(PrismaService);
    const before = await prisma.clubes.count();

    const duplicate = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name: '  águias   fc ', acronym: 'AGU' })
      .expect(409)
      .expect('Content-Type', /application\/json/);
    expect(duplicate.body.message.length).toBeGreaterThan(0);
    expect(await prisma.clubes.count()).toBe(before);

    await expect(
      prisma.clubes.create({
        data: { nome: 'águias fc', sigla: 'AGX' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
    expect(await prisma.clubes.count()).toBe(before);

    const accepted = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name: 'Aguias FC', acronym: 'AGU' })
      .expect(201);

    expect(accepted.body.name).toBe('Aguias FC');
    expect(accepted.body.acronym).toBe('AGU');
  });

  it('refuses a repeated acronym and does not save', async () => {
    const prisma = app.get(PrismaService);
    const before = await prisma.clubes.count();

    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name: 'Alvorada FC', acronym: 'AFC' })
      .expect(409);

    expect(response.body.message.length).toBeGreaterThan(0);
    expect(await prisma.clubes.count()).toBe(before);
  });

  it('rejects an invalid club and does not save', async () => {
    const prisma = app.get(PrismaService);
    const before = await prisma.clubes.count();

    for (const body of [
      { name: 'FC', acronym: 'AFC' },
      { name: 'Águias FC', acronym: 'afc' },
      { name: 'Águias FC', acronym: 'AAA' },
      { name: 'Águias FC', acronym: 'FCA' },
      { name: 'Águias\tFC', acronym: 'AFC' },
      { acronym: 'AFC' },
      { name: null, acronym: 'AFC' },
      [],
    ]) {
      await request(app.getHttpServer())
        .post('/api/v1/clubs')
        .send(body)
        .expect(400);
    }

    for (const raw of ['10', '"x"']) {
      await request(app.getHttpServer())
        .post('/api/v1/clubs')
        .set('Content-Type', 'application/json')
        .send(raw)
        .expect(400);
    }

    expect(await prisma.clubes.count()).toBe(before);
  });

  it('answers 404 when the club id does not exist or is not a canonical positive integer', async () => {
    for (const id of ['abc', '0', '-1', '1.5', '01', '2147483648', '999999999']) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clubs/${id}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }
  });

  it('accepts the 20th club and refuses the 21st', async () => {
    const prisma = app.get(PrismaService);
    let count = await prisma.clubes.count();
    let index = 0;
    while (count < 20) {
      const created = await request(app.getHttpServer())
        .post('/api/v1/clubs')
        .send(clubPayload(index))
        .expect(201);
      expect(created.body.cash).toBe(300);
      index += 1;
      count += 1;
    }

    const before = await prisma.clubes.count();
    expect(before).toBe(20);

    const refused = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send(clubPayload(index))
      .expect(409);
    expect(refused.body.message.length).toBeGreaterThan(0);
    expect(await prisma.clubes.count()).toBe(20);
  });

  describe('list', () => {
    beforeAll(async () => {
      await emptyLeague(app.get(PrismaService));
    });

    it('returns an empty array when there are no clubs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/clubs')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual([]);
    });

    it('sorts by folded name, breaks ties by id, and omits the squad', async () => {
      const created: { id: number; name: string }[] = [];
      for (const club of [
        { name: 'Gama FC', acronym: 'GAM' },
        { name: 'Águias FC', acronym: 'AFC' },
        { name: 'Ana-Maria FC', acronym: 'AMF' },
        { name: 'Aguias FC', acronym: 'AGU' },
        { name: 'Delta FC', acronym: 'DEL' },
        { name: 'Épsilon FC', acronym: 'EPS' },
        { name: 'Ana Lima', acronym: 'ALI' },
      ]) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/clubs')
          .send(club)
          .expect(201);
        created.push(response.body);
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/clubs')
        .query({ sort: 'name', extra: '1' })
        .expect(200);

      expect(response.body.map((club: { name: string }) => club.name)).toEqual([
        'Águias FC',
        'Aguias FC',
        'Ana Lima',
        'Ana-Maria FC',
        'Delta FC',
        'Épsilon FC',
        'Gama FC',
      ]);
      const aguias = created.find((club) => club.name === 'Águias FC');
      const aguiasSemAcento = created.find((club) => club.name === 'Aguias FC');
      expect(response.body.map((club: { id: number }) => club.id)).toEqual([
        aguias.id,
        aguiasSemAcento.id,
        created.find((club) => club.name === 'Ana Lima').id,
        created.find((club) => club.name === 'Ana-Maria FC').id,
        created.find((club) => club.name === 'Delta FC').id,
        created.find((club) => club.name === 'Épsilon FC').id,
        created.find((club) => club.name === 'Gama FC').id,
      ]);
      expect(response.body[0]).not.toHaveProperty('players');
      expect(response.body[0]).toMatchObject({
        squad_value: 0,
        net_worth: 300,
      });
    });

    it('sorts by calculated net worth and ignores a deleted player', async () => {
      const zulu = await request(app.getHttpServer())
        .post('/api/v1/clubs')
        .send({ name: 'Zulu FC', acronym: 'ZUL' })
        .expect(201);
      const alpha = await request(app.getHttpServer())
        .post('/api/v1/clubs')
        .send({ name: 'Alpha FC', acronym: 'ALF' })
        .expect(201);

      const player = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          name: 'Meia Lista',
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
        })
        .expect(201);
      const ghost = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          name: 'Meia Fantasma',
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
        })
        .expect(201);

      const prisma = app.get(PrismaService);
      await prisma.jogadores.update({
        where: { id: player.body.id },
        data: { clube_id: alpha.body.id },
      });
      await prisma.jogadores.update({
        where: { id: ghost.body.id },
        data: { clube_id: zulu.body.id, excluido_em: new Date() },
      });

      const ascending = await request(app.getHttpServer())
        .get('/api/v1/clubs')
        .query({ sort: 'net_worth_asc' })
        .expect(200);
      const names = ascending.body.map((club: { name: string }) => club.name);
      expect(names.indexOf('Zulu FC')).toBeLessThan(names.indexOf('Alpha FC'));
      expect(names.indexOf('Águias FC')).toBeLessThan(names.indexOf('Aguias FC'));
      expect(names.at(-1)).toBe('Alpha FC');

      const alphaRow = ascending.body.find(
        (club: { name: string }) => club.name === 'Alpha FC',
      );
      const zuluRow = ascending.body.find(
        (club: { name: string }) => club.name === 'Zulu FC',
      );
      expect(alphaRow).toMatchObject({ squad_value: 40, net_worth: 340 });
      expect(zuluRow).toMatchObject({ squad_value: 0, net_worth: 300 });

      const descending = await request(app.getHttpServer())
        .get('/api/v1/clubs')
        .query({ sort: 'net_worth_desc' })
        .expect(200);
      expect(descending.body[0].name).toBe('Alpha FC');
      expect(descending.body[1].name).toBe('Águias FC');
    });

    it('rejects an empty, repeated or unknown sort', async () => {
      for (const sort of ['', 'name,net_worth_asc', 'NAME', 'net_worth_asc ']) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/clubs')
          .query({ sort })
          .expect(400);
        expect(response.body.message.length).toBeGreaterThan(0);
      }
    });
  });
});

async function emptyLeague(prisma: PrismaService): Promise<void> {
  const blocked =
    (await prisma.contratos.count()) +
    (await prisma.transacoes.count()) +
    (await prisma.escalacoes.count()) +
    (await prisma.partidas.count());
  if (blocked > 0) {
    throw new Error(
      'A liga de teste tem contratos, transações, escalações ou partidas',
    );
  }

  await prisma.jogadores.updateMany({
    where: { clube_id: { not: null } },
    data: { clube_id: null },
  });
  await prisma.clubes.deleteMany();
}

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

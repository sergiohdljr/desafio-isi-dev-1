import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

function randomLetters(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
}

function randomSigla(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from(
    { length: 3 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
}

async function giveClub(
  app: NestFastifyApplication,
  playerId: number,
): Promise<number> {
  const prisma = app.get(PrismaService);
  const sigla = randomSigla();
  const club = await prisma.clubes.create({
    data: { nome: `Clube ${sigla} ${randomSigla()}`, sigla },
  });
  await prisma.jogadores.update({
    where: { id: playerId },
    data: { clube_id: club.id },
  });
  return club.id;
}

const meiOverall73 = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 68,
  shooting: 65,
  passing: 80,
  dribbling: 78,
  defending: 52,
  physical: 60,
  potential: 86,
};

describe('Players', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a player and returns the stored base value with a live overall', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Meia Exemplo',
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
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.headers.location).toBe(
      `/api/v1/players/${response.body.id}`,
    );
    expect(response.body).toMatchObject({
      name: 'Meia Exemplo',
      position: 'MEI',
      agility: 50,
      age: 25,
      condition: 'APTO',
      base_value: 40,
      market_value: 40,
      pace: 70,
      shooting: 70,
      passing: 80,
      dribbling: 80,
      defending: 50,
      physical: 70,
      potential: 86,
      overall: 75,
      club_id: null,
    });

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${response.body.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(fetched.body).toEqual(response.body);
  });

  it('computes overall 73 for the published meia attributes', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send(meiOverall73)
      .expect(201);

    expect(response.body.overall).toBe(73);
  });

  it('rounds a zagueiro overall of 72.5 up to 73', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Zagueiro Meio',
        position: 'ZAG',
        agility: 50,
        age: 25,
        pace: 50,
        shooting: 90,
        passing: 60,
        dribbling: 40,
        defending: 80,
        physical: 75,
        potential: 90,
      })
      .expect(201);

    expect(response.body.overall).toBe(73);
  });

  it('applies the young-promise base value and the age uplift on market value', async () => {
    const young = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Jovem Promessa',
        position: 'MEI',
        agility: 50,
        age: 18,
        pace: 40,
        shooting: 50,
        passing: 50,
        dribbling: 40,
        defending: 40,
        physical: 40,
        potential: 90,
      })
      .expect(201);

    expect(young.body.overall).toBe(45);
    expect(young.body.base_value).toBe(3.63);
    expect(young.body.market_value).toBe(3.99);

    const priced = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Base Oitenta',
        position: 'GOL',
        agility: 50,
        age: 19,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);

    expect(priced.body.base_value).toBe(82);
    expect(priced.body.market_value).toBe(90.2);
  });

  it('uses the floor when the overall part is zero', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Goleiro Piso',
        position: 'GOL',
        agility: 50,
        age: 36,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 66,
      })
      .expect(201);

    expect(response.body.overall).toBe(40);
    expect(response.body.base_value).toBe(1);
    expect(response.body.market_value).toBe(1);
  });

  it('allows two players with the same name', async () => {
    const payload = {
      name: 'Nome Igual',
      position: 'ATA',
      agility: 40,
      age: 24,
      pace: 70,
      shooting: 70,
      passing: 50,
      dribbling: 50,
      defending: 40,
      physical: 60,
      potential: 80,
    };

    const first = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send(payload)
      .expect(201);
    const second = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send(payload)
      .expect(201);

    expect(second.body.id).not.toBe(first.body.id);
    expect(second.body.name).toBe(first.body.name);
  });

  it('counts a name and a search by unicode code points', async () => {
    const ideograph = '𠀋';
    const accepted = `${ideograph.repeat(50)} ${ideograph.repeat(49)}`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: accepted })
      .expect(201);

    expect(created.body.name).toBe(accepted);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        ...meiOverall73,
        name: `${ideograph.repeat(51)} ${ideograph.repeat(49)}`,
      })
      .expect(400);

    await request(app.getHttpServer())
      .get(`/api/v1/players?search=${encodeURIComponent(ideograph)}`)
      .expect(400);
  });

  it('stores the name with surrounding and repeated spaces collapsed', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: '  Meia   Zeta ' })
      .expect(201);

    expect(response.body.name).toBe('Meia Zeta');
  });

  it('accepts an integer written as 50.0 and ignores calculated fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          ...meiOverall73,
          name: 'Campo Ignorado',
          agility: 50.0,
          base_value: 1,
          market_value: 1,
          overall: 1,
          condition: 'DOENTE',
          club_id: 9,
          loyaltyUntil: 'nope',
        }),
      )
      .expect(201);

    expect(response.body.agility).toBe(50);
    expect(response.body.condition).toBe('APTO');
    expect(response.body.club_id).toBeNull();
    expect(response.body.base_value).not.toBe(1);
    expect(response.body.overall).toBe(73);
  });

  it('rejects a missing required field, a text number, a fraction, and a lowercase position', async () => {
    const { name: _name, ...withoutName } = meiOverall73;
    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send(withoutName)
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, agility: '15' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, age: 50.5 })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, position: 'ata' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Meia\tZeta' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: '\tMeia Zeta' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Meia Zeta\n' })
      .expect(400);
  });

  it('rejects a potential below the best attribute, a mismatched veteran potential, an agility above 85 at 35, and a skill sum above 480', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, potential: 70 })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Veterano Potencial',
        position: 'GOL',
        agility: 50,
        age: 36,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 90,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Agilidade Alta', age: 35, agility: 86 })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        ...meiOverall73,
        name: 'Soma Alta',
        pace: 99,
        shooting: 99,
        passing: 99,
        dribbling: 99,
        defending: 99,
        physical: 99,
        potential: 99,
      })
      .expect(400);
  });

  it('answers 404 when the player id does not exist or is not a canonical positive integer', async () => {
    for (const id of [
      '999999999',
      'abc',
      '0',
      '-1',
      '1.5',
      '01',
      '2147483648',
    ]) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/players/${id}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }
  });

  it('recalculates the market value when the condition changes', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Base Oitenta Jovem',
        position: 'GOL',
        agility: 80,
        age: 21,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);

    expect(created.body.base_value).toBe(82);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/players/${created.body.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updated.body).toEqual({
      ...created.body,
      condition: 'MAL_CONDICIONADO',
      market_value: 84.05,
    });

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(fetched.body).toEqual(updated.body);
  });

  it('applies the published condition discounts, including the cap and the floor', async () => {
    const sick = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Base Oitenta Doente',
        position: 'GOL',
        agility: 10,
        age: 40,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);

    expect(sick.body.base_value).toBe(82);

    const sickValue = await request(app.getHttpServer())
      .patch(`/api/v1/players/${sick.body.id}/condition`)
      .send({ condition: 'DOENTE', name: 'Nome Ignorado' })
      .expect(200);

    expect(sickValue.body.market_value).toBe(49.2);
    expect(sickValue.body.condition).toBe('DOENTE');
    expect(sickValue.body.name).toBe('Base Oitenta Doente');

    const halfDiscount = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Meia Nove',
        position: 'MEI',
        agility: 85,
        age: 25,
        pace: 59,
        shooting: 59,
        passing: 59,
        dribbling: 59,
        defending: 59,
        physical: 59,
        potential: 59,
      })
      .expect(201);

    expect(halfDiscount.body.base_value).toBe(9.5);
    expect(halfDiscount.body.overall).toBe(59);

    const halfValue = await request(app.getHttpServer())
      .patch(`/api/v1/players/${halfDiscount.body.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);

    expect(halfValue.body.market_value).toBe(8.79);

    const floored = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: 'Goleiro Piso Condicao',
        position: 'GOL',
        agility: 50,
        age: 35,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 66,
      })
      .expect(201);

    expect(floored.body.base_value).toBe(1);

    const flooredValue = await request(app.getHttpServer())
      .patch(`/api/v1/players/${floored.body.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);

    expect(flooredValue.body.market_value).toBe(1);
  });

  it('keeps the player unchanged when the condition is the same', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Ja Apto' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/players/${created.body.id}/condition`)
      .send({ condition: 'APTO' })
      .expect(200);

    expect(updated.body).toEqual(created.body);
  });

  it('refuses a direct change from sick to fit and does not store it', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Fica Doente' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/players/${created.body.id}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);

    const refused = await request(app.getHttpServer())
      .patch(`/api/v1/players/${created.body.id}/condition`)
      .send({ condition: 'APTO' })
      .expect(409)
      .expect('Content-Type', /application\/json/);

    expect(typeof refused.body.message).toBe('string');
    expect(refused.body.message.length).toBeGreaterThan(0);
    expect(JSON.stringify(refused.body)).not.toContain('stack');

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(fetched.body.condition).toBe('DOENTE');
  });

  it('rejects a missing, null, or unknown condition and does not store it', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Condicao Invalida' })
      .expect(201);

    for (const body of [{}, { condition: null }, { condition: 'doente' }]) {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/players/${created.body.id}/condition`)
        .send(body)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
    }

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(fetched.body.condition).toBe('APTO');
  });

  it('updates name, position, agility and age while keeping skills, potential and base value', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Meia Original', age: 19 })
      .expect(201);

    expect(created.body.base_value).toBe(40.68);
    expect(created.body.overall).toBe(73);
    expect(created.body.market_value).toBe(44.75);

    const updated = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: '  Ataque   Novo ',
        position: 'ATA',
        agility: 40,
        age: 32,
        pace: 1,
        potential: 1,
        base_value: 1,
        condition: 'DOENTE',
        club_id: 3,
        overall: 1,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updated.body).toEqual({
      ...created.body,
      name: 'Ataque Novo',
      position: 'ATA',
      agility: 40,
      age: 32,
      overall: 69,
      market_value: 36.61,
    });

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(fetched.body).toEqual(updated.body);
  });

  it('keeps the registered potential when the edit reaches 33 years', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Potencial Fixo', age: 25 })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Potencial Fixo',
        position: 'MEI',
        agility: 85,
        age: 33,
      })
      .expect(200);

    expect(updated.body.age).toBe(33);
    expect(updated.body.potential).toBe(created.body.potential);
    expect(updated.body.base_value).toBe(created.body.base_value);
  });

  it('refuses a lower age and a position change for a player who has a club', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Idade Clube', age: 25 })
      .expect(201);

    const younger = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Idade Clube',
        position: 'MEI',
        agility: 85,
        age: 24,
      })
      .expect(409)
      .expect('Content-Type', /application\/json/);

    expect(younger.body.message.length).toBeGreaterThan(0);
    expect(JSON.stringify(younger.body)).not.toContain('stack');

    const clubId = await giveClub(app, created.body.id);
    const moved = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Idade Clube',
        position: 'ATA',
        agility: 85,
        age: 25,
      })
      .expect(409);

    expect(moved.body.message.length).toBeGreaterThan(0);

    const kept = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(kept.body.age).toBe(25);
    expect(kept.body.position).toBe('MEI');
    expect(kept.body.club_id).toBe(clubId);

    const renamed = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Idade Mantida',
        position: 'MEI',
        agility: 70,
        age: 26,
      })
      .expect(200);

    expect(renamed.body.name).toBe('Idade Mantida');
    expect(renamed.body.position).toBe('MEI');
    expect(renamed.body.club_id).toBe(clubId);
  });

  it('rejects agility above 85 from age 35 and any other invalid edit without saving', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Edicao Invalida', age: 30 })
      .expect(201);

    const tooAgile = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Edicao Invalida',
        position: 'MEI',
        agility: 86,
        age: 35,
      })
      .expect(400);

    expect(tooAgile.body.message.length).toBeGreaterThan(0);

    const allowed = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .send({
        name: 'Edicao Invalida',
        position: 'MEI',
        agility: 85,
        age: 35,
      })
      .expect(200);

    expect(allowed.body.agility).toBe(85);
    expect(allowed.body.age).toBe(35);

    const current = {
      name: 'Edicao Invalida',
      position: 'MEI',
      agility: 85,
      age: 35,
    };
    const { name: _name, ...withoutName } = current;
    for (const body of [
      withoutName,
      { ...current, name: null },
      { ...current, agility: '15' },
      { ...current, age: 35.5 },
      { ...current, position: 'mei' },
      { ...current, name: 'Meia\tInvalida' },
      [],
    ]) {
      await request(app.getHttpServer())
        .put(`/api/v1/players/${created.body.id}`)
        .send(body)
        .expect(400);
    }

    const integer = await request(app.getHttpServer())
      .put(`/api/v1/players/${created.body.id}`)
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          ...current,
          agility: 50.0,
        }).replace('"agility":50', '"agility":50.0'),
      )
      .expect(200);

    expect(integer.body.agility).toBe(50);

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);

    expect(fetched.body.agility).toBe(50);
    expect(fetched.body.age).toBe(35);
    expect(fetched.body.position).toBe('MEI');
    expect(fetched.body.name).toBe('Edicao Invalida');
  });

  it('lists matching players with page metadata and an empty page when nothing matches', async () => {
    const missing = randomLetters(16);
    const empty = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: missing })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(empty.body).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
    });

    const token = randomLetters(16);
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: `Lista ${token}` })
      .expect(201);

    const listed = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token.toUpperCase() })
      .expect(200);

    expect(listed.body.data).toEqual([created.body]);
    expect(listed.body.meta).toEqual({
      page: 1,
      limit: 10,
      total_items: 1,
      total_pages: 1,
    });
  });

  it('combines filters and uses market value, not the stored base value', async () => {
    const token = randomLetters(16);
    const young = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: `Valor ${token} Jovem`,
        position: 'GOL',
        agility: 50,
        age: 19,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);
    const adult = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: `Valor ${token} Adulto`,
        position: 'GOL',
        agility: 50,
        age: 25,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);
    const sick = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: `Valor ${token} Doente`,
        position: 'GOL',
        agility: 10,
        age: 40,
        pace: 82,
        shooting: 1,
        passing: 82,
        dribbling: 1,
        defending: 82,
        physical: 82,
        potential: 82,
      })
      .expect(201);

    expect(young.body).toMatchObject({ base_value: 82, market_value: 90.2 });
    expect(adult.body).toMatchObject({ base_value: 82, market_value: 82 });
    expect(sick.body.base_value).toBe(82);

    await request(app.getHttpServer())
      .patch(`/api/v1/players/${sick.body.id}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);
    const sickNow = await request(app.getHttpServer())
      .get(`/api/v1/players/${sick.body.id}`)
      .expect(200);
    expect(sickNow.body.market_value).toBe(49.2);

    const clubId = await giveClub(app, sick.body.id);
    const names = async (query: Record<string, string>) => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/players')
        .query({ search: token, ...query })
        .expect(200);
      return response.body.data.map((player: { name: string }) => player.name);
    };

    expect(await names({ min_value: '49.2', max_value: '49.20' })).toEqual([
      sick.body.name,
    ]);
    expect(await names({ min_value: '90', max_value: '90.2' })).toEqual([
      young.body.name,
    ]);
    expect(await names({ min_value: '80' })).toEqual([
      adult.body.name,
      young.body.name,
    ]);
    expect(await names({ max_value: '50' })).toEqual([sick.body.name]);
    expect(await names({ min_age: '40' })).toEqual([sick.body.name]);
    expect(await names({ max_age: '19' })).toEqual([young.body.name]);
    expect(await names({ min_age: '25', max_age: '25' })).toEqual([
      adult.body.name,
    ]);
    expect(
      await names({
        position: 'GOL',
        condition: 'DOENTE',
        free: 'false',
        club_id: String(clubId),
        min_age: '32',
        max_age: '45',
        min_value: '49.2',
        max_value: '49.2',
      }),
    ).toEqual([sick.body.name]);
    expect(await names({ free: 'true' })).toEqual([
      adult.body.name,
      young.body.name,
    ]);
    expect(await names({ free: 'false', club_id: String(clubId) })).toEqual([
      sick.body.name,
    ]);

    const otherClub = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: `Valor ${token} Extra` })
      .expect(201);
    const otherClubId = await giveClub(app, otherClub.body.id);
    expect(await names({ club_id: String(otherClubId) })).toEqual([
      otherClub.body.name,
    ]);

    const missingClub = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ club_id: '2147483647' })
      .expect(404)
      .expect('Content-Type', /application\/json/);
    expect(missingClub.body.message.length).toBeGreaterThan(0);

    const ignored = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token, curious: 'yes' })
      .expect(200);
    expect(ignored.body.meta.total_items).toBe(4);
  });

  it('sorts by name, market value, age and position, then by name and id', async () => {
    const token = randomLetters(16);
    const created = [];
    for (const name of [
      `${token} Ana-Maria`,
      `${token} Gama`,
      `${token} Ana Lima`,
      `${token} Delta`,
      `${token} Épsilon`,
      `${token} Igual`,
      `${token} Igual`,
    ]) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({ ...meiOverall73, name, age: name.endsWith('Igual') ? 30 : 25 })
        .expect(201);
      created.push(response.body);
    }

    const byName = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: `${token} epsilon` })
      .expect(200);
    expect(
      byName.body.data.map((player: { name: string }) => player.name),
    ).toEqual([`${token} Épsilon`]);

    const ordered = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token, sort: 'name' })
      .expect(200);
    expect(
      ordered.body.data.map((player: { name: string }) => player.name),
    ).toEqual([
      `${token} Ana Lima`,
      `${token} Ana-Maria`,
      `${token} Delta`,
      `${token} Épsilon`,
      `${token} Gama`,
      `${token} Igual`,
      `${token} Igual`,
    ]);
    const equals = ordered.body.data.filter(
      (player: { name: string }) => player.name === `${token} Igual`,
    );
    expect(equals.map((player: { id: number }) => player.id)).toEqual([
      created[5].id,
      created[6].id,
    ]);

    const positions = ['ATA', 'MEI', 'GOL', 'LAT', 'ZAG'];
    for (const position of positions) {
      await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({
          ...meiOverall73,
          name: `${token} ${position} Linha`,
          position,
        })
        .expect(201);
    }
    const byPosition = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token, sort: 'position,name', limit: '50' })
      .expect(200);
    expect(
      byPosition.body.data
        .filter((player: { name: string }) => player.name.includes('Linha'))
        .map((player: { position: string }) => player.position),
    ).toEqual(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']);

    const younger = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: `${token} Omega`, age: 18 })
      .expect(201);
    const older = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: `${token} Alfa`, age: 22 })
      .expect(201);
    const byAge = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({
        search: token,
        sort: 'age_asc,name',
        min_age: '18',
        max_age: '22',
      })
      .expect(200);
    expect(
      byAge.body.data.map((player: { name: string }) => player.name),
    ).toEqual([younger.body.name, older.body.name]);

    const cheap = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: `${token} Zeta`,
        position: 'GOL',
        agility: 50,
        age: 36,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 66,
      })
      .expect(201);
    const alsoCheap = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: `${token} Alfa Barato`,
        position: 'GOL',
        agility: 50,
        age: 36,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 66,
      })
      .expect(201);
    expect(cheap.body.market_value).toBe(1);
    expect(alsoCheap.body.market_value).toBe(1);
    const byValue = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token, sort: 'value_asc,name', max_value: '1' })
      .expect(200);
    expect(
      byValue.body.data.map((player: { name: string }) => player.name),
    ).toEqual([alsoCheap.body.name, cheap.body.name]);
    const byValueDesc = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token, sort: 'value_desc', max_value: '1' })
      .expect(200);
    expect(
      byValueDesc.body.data.map((player: { name: string }) => player.name),
    ).toEqual([alsoCheap.body.name, cheap.body.name]);
  });

  it('paginates after filtering and sorting', async () => {
    const token = randomLetters(16);
    const suffixes = [
      'Aa',
      'Ab',
      'Ac',
      'Ad',
      'Ae',
      'Af',
      'Ag',
      'Ah',
      'Ai',
      'Aj',
      'Ak',
      'Al',
    ];
    for (const suffix of suffixes) {
      await request(app.getHttpServer())
        .post('/api/v1/players')
        .send({ ...meiOverall73, name: `${token} ${suffix}` })
        .expect(201);
    }

    const page = async (pageNumber: number) => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/players')
        .query({ search: token, page: String(pageNumber), limit: '5' })
        .expect(200);
      return response.body as {
        data: { name: string }[];
        meta: {
          page: number;
          limit: number;
          total_items: number;
          total_pages: number;
        };
      };
    };

    const first = await page(1);
    const second = await page(2);
    const third = await page(3);
    const fourth = await page(4);
    const names = [...first.data, ...second.data, ...third.data].map(
      (player) => player.name,
    );

    expect(names).toEqual(suffixes.map((suffix) => `${token} ${suffix}`));
    expect(third.data).toHaveLength(2);
    expect(fourth.data).toEqual([]);
    for (const body of [first, second, third, fourth]) {
      expect(body.meta).toMatchObject({
        limit: 5,
        total_items: 12,
        total_pages: 3,
      });
    }
    expect(fourth.meta.page).toBe(4);
  });

  it('rejects invalid list parameters', async () => {
    const urls = [
      '/api/v1/players?position=',
      '/api/v1/players?position=mei',
      '/api/v1/players?condition=doente',
      '/api/v1/players?free=TRUE',
      '/api/v1/players?sort=POSITION',
      '/api/v1/players?sort=name, name',
      '/api/v1/players?sort=name,name',
      '/api/v1/players?sort=age_asc,age_desc',
      '/api/v1/players?sort=name,value_asc,age_asc',
      '/api/v1/players?page=01',
      '/api/v1/players?page=0',
      '/api/v1/players?limit=51',
      '/api/v1/players?limit=10.5',
      '/api/v1/players?min_value=10,5',
      '/api/v1/players?min_value=1e2',
      '/api/v1/players?min_value=01',
      '/api/v1/players?min_age=15',
      '/api/v1/players?min_age=30&max_age=20',
      '/api/v1/players?min_value=10&max_value=5',
      '/api/v1/players?free=true&club_id=1',
      '/api/v1/players?search=a',
      '/api/v1/players?search=%20%20',
      '/api/v1/players?search=ab%09',
      '/api/v1/players?club_id=abc',
      '/api/v1/players?club_id=0',
      '/api/v1/players?min_value=550.01',
    ];

    for (const url of urls) {
      const response = await request(app.getHttpServer())
        .get(url)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      expect(response.body.message.length).toBeGreaterThan(0);
    }

    const accepted = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({
        search: randomLetters(16),
        min_value: '0.5',
        max_value: '10.50',
        sort: 'value_desc,position',
      })
      .expect(200);
    expect(accepted.body.data).toEqual([]);
  });

  it('deletes a free player without removing the row and hides them from the api', async () => {
    const token = randomLetters(16);
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: `Livre ${token}` })
      .expect(201);

    const deleted = await request(app.getHttpServer())
      .delete(`/api/v1/players/${created.body.id}`)
      .send({ name: 'Ignorado' })
      .expect(204);

    expect(deleted.text).toBe('');

    const prisma = app.get(PrismaService);
    const row = await prisma.jogadores.findUnique({
      where: { id: created.body.id },
    });
    expect(row).not.toBeNull();
    expect(row?.excluido_em).toBeInstanceOf(Date);

    const missing = `/api/v1/players/${created.body.id}`;
    const responses = await Promise.all([
      request(app.getHttpServer()).get(missing),
      request(app.getHttpServer()).put(missing).send({
        name: 'Livre Sumiu',
        position: 'MEI',
        agility: 50,
        age: 25,
      }),
      request(app.getHttpServer())
        .patch(`${missing}/condition`)
        .send({ condition: 'DOENTE' }),
      request(app.getHttpServer()).delete(missing),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }

    const listed = await request(app.getHttpServer())
      .get('/api/v1/players')
      .query({ search: token })
      .expect(200);
    expect(listed.body.data).toEqual([]);
  });

  it('refuses to delete a player who belongs to a club', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meiOverall73, name: 'Preso No Clube' })
      .expect(201);
    await giveClub(app, created.body.id);

    const refused = await request(app.getHttpServer())
      .delete(`/api/v1/players/${created.body.id}`)
      .expect(409)
      .expect('Content-Type', /application\/json/);
    expect(refused.body.message.length).toBeGreaterThan(0);
    expect(JSON.stringify(refused.body)).not.toContain('stack');

    const row = await app.get(PrismaService).jogadores.findUnique({
      where: { id: created.body.id },
    });
    expect(row?.excluido_em).toBeNull();

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/players/${created.body.id}`)
      .expect(200);
    expect(fetched.body.club_id).not.toBeNull();
  });

  it('answers 404 when deleting a player that does not exist', async () => {
    for (const id of ['999999999', 'abc', '0', '01']) {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/players/${id}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }
  });

  it('answers 404 when editing a player that does not exist', async () => {
    for (const id of [
      '999999999',
      'abc',
      '0',
      '-1',
      '1.5',
      '01',
      '2147483648',
    ]) {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/players/${id}`)
        .send({
          name: 'Ninguem Aqui',
          position: 'MEI',
          agility: 50,
          age: 25,
        })
        .expect(404)
        .expect('Content-Type', /application\/json/);

      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }
  });

  it('answers 404 when changing the condition of a missing player', async () => {
    for (const id of ['999999999', 'abc', '01']) {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/players/${id}/condition`)
        .send({ condition: 'DOENTE' })
        .expect(404)
        .expect('Content-Type', /application\/json/);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body)).not.toContain('stack');
    }
  });
});

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

const loyalty = '2027-06-15T10:15-03:00';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

describe('League', () => {
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

  it('starts without a lineup and saves a complete one without touching the cash', async () => {
    const clubId = await createClub();
    const before = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/lineup`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(before.body).toEqual({
      club_id: clubId,
      formation: null,
      complete: false,
      players: [],
    });

    const ids = await Promise.all([
      sign(clubId, 'Goleiro Norte', 'GOL'),
      sign(clubId, 'Zaga Norte', 'ZAG'),
      sign(clubId, 'Lateral Norte', 'LAT'),
      sign(clubId, 'Meia Norte', 'MEI'),
      sign(clubId, 'Ataque Norte', 'ATA'),
    ]);
    const cash = await clubCash(clubId);

    const saved = await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({
        formation: '2-1-1',
        player_ids: [ids[4], ids[0], ids[2], ids[1], ids[3]],
        cash: 1,
      })
      .expect(200);

    expect(saved.body.formation).toBe('2-1-1');
    expect(saved.body.complete).toBe(true);
    expect(
      saved.body.players.map((player: { name: string }) => player.name),
    ).toEqual([
      'Goleiro Norte',
      'Zaga Norte',
      'Lateral Norte',
      'Meia Norte',
      'Ataque Norte',
    ]);
    expect(saved.body.players[0]).toEqual(
      expect.objectContaining({
        position: 'GOL',
        club_id: clubId,
        condition: 'APTO',
      }),
    );
    expect(await clubCash(clubId)).toBe(cash);

    const again = await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation: '3-1', player_ids: ids })
      .expect(409);
    expect(again.body.message.length).toBeGreaterThan(0);
    const kept = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/lineup`)
      .expect(200);
    expect(kept.body.formation).toBe('2-1-1');
    expect(kept.body.complete).toBe(true);
  });

  it('rejects a bad lineup body, a missing player and a starter who cannot play', async () => {
    const clubId = await createClub();
    const otherId = await createClub();
    const ids = await Promise.all([
      sign(clubId, 'Goleiro Sul', 'GOL'),
      sign(clubId, 'Zaga Sul', 'ZAG'),
      sign(clubId, 'Lateral Sul', 'LAT'),
      sign(clubId, 'Meia Sul', 'MEI'),
      sign(clubId, 'Ataque Sul', 'ATA'),
    ]);
    const outsider = await sign(otherId, 'Ataque Fora', 'ATA');
    const sick = await sign(clubId, 'Ponta Doente', 'ATA');
    await request(app.getHttpServer())
      .patch(`/api/v1/players/${sick}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);
    const prisma = app.get(PrismaService);
    const seats = () =>
      prisma.escalacoes.count({ where: { clube_id: clubId } });
    const before = await seats();

    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation: '4-0', player_ids: ids })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation: '2-1-1', player_ids: ids.slice(0, 4) })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({
        formation: '2-1-1',
        player_ids: [ids[0], ids[0], ids[1], ids[2], ids[3]],
      })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation: '2-1-1', player_ids: '12345' })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({
        formation: '2-1-1',
        player_ids: [ids[0], ids[1], ids[2], ids[3], 2147483646],
      })
      .expect(404);
    await request(app.getHttpServer())
      .put('/api/v1/clubs/abc/lineup')
      .send({ formation: '2-1-1', player_ids: ids })
      .expect(404);
    const unfit = await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({
        formation: '2-1-1',
        player_ids: [ids[0], ids[1], ids[2], outsider, ids[4]],
      })
      .expect(409);
    expect(unfit.body.message.length).toBeGreaterThan(0);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({
        formation: '2-2',
        player_ids: [ids[0], ids[1], ids[2], sick, ids[4]],
      })
      .expect(409);
    expect(await seats()).toBe(before);
  });

  it('drops a sold or sick starter and does not put him back on his own', async () => {
    const clubId = await createClub();
    const ids = await Promise.all([
      sign(clubId, 'Goleiro Leste', 'GOL'),
      sign(clubId, 'Zaga Leste', 'ZAG'),
      sign(clubId, 'Lateral Leste', 'LAT'),
      sign(clubId, 'Meia Leste', 'MEI'),
      sign(clubId, 'Ataque Leste', 'ATA'),
    ]);
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation: '2-1-1', player_ids: ids })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/players/${ids[4]}/sell`)
      .expect(200);
    const sold = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/lineup`)
      .expect(200);
    expect(sold.body.formation).toBe('2-1-1');
    expect(sold.body.complete).toBe(false);
    expect(
      sold.body.players.map((player: { name: string }) => player.name),
    ).toEqual(['Goleiro Leste', 'Zaga Leste', 'Lateral Leste', 'Meia Leste']);

    await request(app.getHttpServer())
      .patch(`/api/v1/players/${ids[3]}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);
    const sick = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/lineup`)
      .expect(200);
    expect(
      sick.body.players.map((player: { id: number }) => player.id),
    ).toEqual([ids[0], ids[1], ids[2]]);

    await request(app.getHttpServer())
      .patch(`/api/v1/players/${ids[3]}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    const recovered = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/lineup`)
      .expect(200);
    expect(recovered.body.players).toHaveLength(3);
    expect(recovered.body.complete).toBe(false);

    const rival = await createClub();
    const rivalIds = await five(rival, 'Rival');
    await lineUp(rival, '2-2', rivalIds);
    const refused = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: clubId, away_club_id: rival })
      .expect(409);
    expect(refused.body.message.length).toBeGreaterThan(0);
    expect(await app.get(PrismaService).partidas.count()).toBe(0);
  });

  it('plays Águias against Delta as 1-2 and leaves the squad untouched', async () => {
    await emptyLeague(app.get(PrismaService));
    const home = await createNamedClub('Águias FC', 'AFC');
    const away = await createNamedClub('Delta FC', 'DFC');
    const aguias = await squad(home, [
      skill('Rui Prado', 'GOL', { defending: 77 }),
      skill('Téo Brandão', 'ZAG', { defending: 84 }),
      skill(
        'Davi Lins',
        'LAT',
        { dribbling: 74, defending: 66 },
        'MAL_CONDICIONADO',
      ),
      skill('Lauro Neves', 'MEI', { passing: 82 }),
      skill('Otto Rangel', 'ATA', { shooting: 75 }),
    ]);
    const delta = await squad(away, [
      skill('Ivo Teles', 'GOL', { defending: 72 }),
      skill('Hugo Vaz', 'ZAG', { defending: 84 }),
      skill('Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
      skill('Nei Soares', 'MEI', { passing: 70 }),
      skill('Ugo Falcão', 'ATA', { shooting: 81 }),
    ]);
    await lineUp(home, '2-1-1', aguias);
    await lineUp(away, '2-1-1', delta);
    const cash = await clubCash(home);
    const shooting = await playerShooting(aguias[4]);

    const played = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: home, away_club_id: away, extra: true })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(played.headers.location).toBe(`/api/v1/matches/${played.body.id}`);
    expect(played.body.home).toMatchObject({
      club_id: home,
      club_name: 'Águias FC',
      formation: '2-1-1',
      goals: 1,
    });
    expect(played.body.away).toMatchObject({
      club_id: away,
      club_name: 'Delta FC',
      formation: '2-1-1',
      goals: 2,
    });
    expect(played.body.result).toBe('VISITANTE');
    expect(played.body.played_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
    );
    expect(
      played.body.duels.map((duel: { goal: boolean }) => duel.goal),
    ).toEqual([true, false, false, true, false, true]);
    expect(played.body.duels[2]).toMatchObject({
      order: 3,
      attacker: { player_name: 'Davi Lins', attribute: 'dribbling', value: 63 },
      defender: {
        player_name: 'Lino Matos',
        attribute: 'defending',
        value: 63,
      },
      goal: false,
    });
    expect(played.body.duels[5]).toMatchObject({
      order: 6,
      attacking_club_id: away,
      attacker: { player_name: 'Lino Matos', value: 79 },
      defender: {
        player_name: 'Davi Lins',
        attribute: 'defending',
        value: 56,
        condition: 'MAL_CONDICIONADO',
      },
    });
    expect(await clubCash(home)).toBe(cash);
    expect(await playerShooting(aguias[4])).toBe(shooting);
    const lineup = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${home}/lineup`)
      .expect(200);
    expect(lineup.body.complete).toBe(true);

    await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: home, away_club_id: away })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: home, away_club_id: 2147483646 })
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({})
      .expect(400);
  });

  it('lists matches newest first and keeps a played duel after the player changes', async () => {
    await emptyLeague(app.get(PrismaService));
    const home = await createNamedClub('Casa FC', 'CFC');
    const away = await createNamedClub('Visita FC', 'VFC');
    const third = await createNamedClub('Neutro FC', 'NFC');
    const homeIds = await five(home, 'Casa');
    const awayIds = await five(away, 'Visita');
    await lineUp(home, '2-2', homeIds);
    await lineUp(away, '2-2', awayIds);

    const first = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: home, away_club_id: away })
      .expect(201);
    const second = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: away, away_club_id: home })
      .expect(201);
    const prisma = app.get(PrismaService);
    const stamp = new Date('2026-10-14T15:00:00.000Z');
    await prisma.partidas.updateMany({
      data: { jogada_em: stamp },
    });

    const list = await request(app.getHttpServer())
      .get('/api/v1/matches')
      .expect(200);
    expect(list.body.map((match: { id: number }) => match.id)).toEqual([
      second.body.id,
      first.body.id,
    ]);
    expect(list.body[0].duels).toBeUndefined();
    expect(list.body[0].played_at).toMatch(/-03:00$/);

    const filtered = await request(app.getHttpServer())
      .get('/api/v1/matches')
      .query({ club_id: String(third) })
      .expect(200);
    expect(filtered.body).toEqual([]);
    const homeGames = await request(app.getHttpServer())
      .get('/api/v1/matches')
      .query({ club_id: String(home) })
      .expect(200);
    expect(homeGames.body).toHaveLength(2);
    await request(app.getHttpServer())
      .get('/api/v1/matches')
      .query({ club_id: '01' })
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/matches')
      .query({ club_id: '2147483646' })
      .expect(404);

    const detail = await request(app.getHttpServer())
      .get(`/api/v1/matches/${first.body.id}`)
      .expect(200);
    expect(detail.body.duels).toHaveLength(6);
    const frozenAttack = detail.body.duels[0].attacker.value;
    await prisma.jogadores.update({
      where: { id: detail.body.duels[0].attacker.player_id },
      data: { finalizacao: 11, passe: 11, drible: 11, defesa: 11 },
    });
    await request(app.getHttpServer())
      .patch(
        `/api/v1/players/${detail.body.duels[0].attacker.player_id}/condition`,
      )
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    const again = await request(app.getHttpServer())
      .get(`/api/v1/matches/${first.body.id}`)
      .expect(200);
    expect(again.body.duels[0].attacker.value).toBe(frozenAttack);
    expect(again.body.duels[0].attacker.condition).toBe(
      detail.body.duels[0].attacker.condition,
    );
    await request(app.getHttpServer()).get('/api/v1/matches/abc').expect(404);
  });

  it('ranks every club from the four-match example', async () => {
    await emptyLeague(app.get(PrismaService));
    const aguias = await createNamedClub('Águias FC', 'AFC');
    const delta = await createNamedClub('Delta FC', 'DFC');
    const gama = await createNamedClub('Gama SC', 'GSC');
    const epsilon = await createNamedClub('Épsilon EC', 'EEC');
    const tubaroes = await createNamedClub('Tubarões EC', 'TEC');
    const mangue = await createNamedClub('Mangue FC', 'MFC');
    const sides = {
      aguias: await tuned(aguias, 'Aguias'),
      delta: await tuned(delta, 'Delta'),
      gama: await tuned(gama, 'Gama'),
      epsilon: await tuned(epsilon, 'Epsilon'),
    };
    await lineUp(aguias, '2-1-1', sides.aguias);
    await lineUp(delta, '2-1-1', sides.delta);
    await lineUp(gama, '2-1-1', sides.gama);
    await lineUp(epsilon, '2-1-1', sides.epsilon);

    await tune(sides.aguias, {
      gk: 50,
      zag: 90,
      latDribble: 10,
      latDef: 40,
      mei: 10,
      ata: 80,
    });
    await tune(sides.delta, {
      gk: 70,
      zag: 90,
      latDribble: 80,
      latDef: 90,
      mei: 10,
      ata: 80,
    });
    expect(await play(aguias, delta)).toMatchObject({
      home: { goals: 1 },
      away: { goals: 2 },
    });

    await tune(sides.gama, {
      gk: 50,
      zag: 90,
      latDribble: 10,
      latDef: 90,
      mei: 80,
      ata: 80,
    });
    await tune(sides.epsilon, {
      gk: 70,
      zag: 50,
      latDribble: 10,
      latDef: 90,
      mei: 10,
      ata: 80,
    });
    expect(await play(gama, epsilon)).toMatchObject({
      home: { goals: 2 },
      away: { goals: 1 },
    });

    await tune(sides.epsilon, {
      gk: 40,
      zag: 40,
      latDribble: 90,
      latDef: 40,
      mei: 90,
      ata: 90,
    });
    await tune(sides.aguias, {
      gk: 50,
      zag: 50,
      latDribble: 10,
      latDef: 80,
      mei: 80,
      ata: 80,
    });
    expect(await play(epsilon, aguias)).toMatchObject({
      home: { goals: 3 },
      away: { goals: 2 },
    });

    await tune(sides.delta, {
      gk: 40,
      zag: 80,
      latDribble: 10,
      latDef: 80,
      mei: 10,
      ata: 10,
    });
    await tune(sides.gama, {
      gk: 80,
      zag: 80,
      latDribble: 10,
      latDef: 80,
      mei: 10,
      ata: 90,
    });
    expect(await play(delta, gama)).toMatchObject({
      home: { goals: 0 },
      away: { goals: 1 },
    });

    const table = await request(app.getHttpServer())
      .get('/api/v1/standings')
      .expect(200);
    expect(
      table.body.map(
        (row: {
          club_name: string;
          points: number;
          goal_difference: number;
          goals_for: number;
        }) => [row.club_name, row.points, row.goal_difference, row.goals_for],
      ),
    ).toEqual([
      ['Gama SC', 6, 2, 3],
      ['Épsilon EC', 3, 0, 4],
      ['Delta FC', 3, 0, 2],
      ['Mangue FC', 0, 0, 0],
      ['Tubarões EC', 0, 0, 0],
      ['Águias FC', 0, -2, 3],
    ]);
    expect(table.body.map((row: { position: number }) => row.position)).toEqual(
      [1, 2, 3, 4, 5, 6],
    );
    expect(table.body[0]).toMatchObject({
      club_id: gama,
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goals_against: 1,
    });
    expect(
      table.body.find((row: { club_id: number }) => row.club_id === mangue),
    ).toMatchObject({
      played: 0,
      points: 0,
    });
    expect(
      table.body.find((row: { club_id: number }) => row.club_id === tubaroes),
    ).toMatchObject({
      played: 0,
      points: 0,
    });

    await play(aguias, delta);
    const next = await request(app.getHttpServer())
      .get('/api/v1/standings')
      .expect(200);
    expect(
      next.body.find((row: { club_id: number }) => row.club_id === aguias)
        .played,
    ).toBe(3);
  });

  async function play(home: number, away: number) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/matches')
      .send({ home_club_id: home, away_club_id: away })
      .expect(201);
    return response.body as {
      home: { goals: number };
      away: { goals: number };
    };
  }

  async function createClub(): Promise<number> {
    serial += 1;
    const first = alphabet[Math.floor((serial - 1) / 26)] ?? 'A';
    const second = alphabet[(serial - 1) % 26] ?? 'A';
    return createNamedClub(
      `Quadra ${first}${second} Norte`,
      `Q${first}${second}`,
    );
  }

  async function createNamedClub(
    name: string,
    acronym: string,
  ): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return response.body.id as number;
  }

  async function sign(
    clubId: number,
    name: string,
    position: string,
    skills: Partial<Skills> = {},
    condition?: 'MAL_CONDICIONADO',
  ): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name,
        position,
        agility: 50,
        age: 25,
        pace: 40,
        shooting: 40,
        passing: 40,
        dribbling: 40,
        defending: 40,
        physical: 40,
        potential: 90,
      })
      .expect(201);
    const id = response.body.id as number;
    await app.get(PrismaService).jogadores.update({
      where: { id },
      data: {
        velocidade: skills.pace ?? 40,
        finalizacao: skills.shooting ?? 40,
        passe: skills.passing ?? 40,
        drible: skills.dribbling ?? 40,
        defesa: skills.defending ?? 40,
        valor_base: '1.00',
      },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${id}/buy`)
      .send({ club_id: clubId, loyalty_until: loyalty })
      .expect(200);
    if (condition) {
      await request(app.getHttpServer())
        .patch(`/api/v1/players/${id}/condition`)
        .send({ condition })
        .expect(200);
    }
    return id;
  }

  async function squad(
    clubId: number,
    players: Array<ReturnType<typeof skill>>,
  ): Promise<number[]> {
    const ids: number[] = [];
    for (const player of players) {
      ids.push(
        await sign(
          clubId,
          player.name,
          player.position,
          player,
          player.condition,
        ),
      );
    }
    return ids;
  }

  async function five(clubId: number, label: string): Promise<number[]> {
    return squad(clubId, [
      skill(`Goleiro ${label}`, 'GOL', {}),
      skill(`Zaga ${label}`, 'ZAG', {}),
      skill(`Lateral ${label}`, 'LAT', {}),
      skill(`Ponta ${label}`, 'ATA', {}),
      skill(`Centro ${label}`, 'ATA', {}),
    ]);
  }

  async function tuned(clubId: number, label: string): Promise<number[]> {
    return squad(clubId, [
      skill(`Goleiro ${label}`, 'GOL', {}),
      skill(`Zaga ${label}`, 'ZAG', {}),
      skill(`Lateral ${label}`, 'LAT', {}),
      skill(`Meia ${label}`, 'MEI', {}),
      skill(`Ataque ${label}`, 'ATA', {}),
    ]);
  }

  async function tune(ids: number[], sheet: Sheet): Promise<void> {
    const prisma = app.get(PrismaService);
    const [gk, zag, lat, mei, ata] = ids;
    await prisma.jogadores.update({
      where: { id: gk },
      data: { defesa: sheet.gk },
    });
    await prisma.jogadores.update({
      where: { id: zag },
      data: { defesa: sheet.zag },
    });
    await prisma.jogadores.update({
      where: { id: lat },
      data: { drible: sheet.latDribble, defesa: sheet.latDef },
    });
    await prisma.jogadores.update({
      where: { id: mei },
      data: { passe: sheet.mei },
    });
    await prisma.jogadores.update({
      where: { id: ata },
      data: { finalizacao: sheet.ata },
    });
  }

  async function lineUp(
    clubId: number,
    formation: string,
    playerIds: number[],
  ): Promise<void> {
    await request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send({ formation, player_ids: playerIds })
      .expect(200);
  }

  async function clubCash(clubId: number): Promise<number> {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}`)
      .expect(200);
    return response.body.cash as number;
  }

  async function playerShooting(playerId: number): Promise<number> {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/players/${playerId}`)
      .expect(200);
    return response.body.shooting as number;
  }
});

type Skills = {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
};

type Sheet = {
  gk: number;
  zag: number;
  latDribble: number;
  latDef: number;
  mei: number;
  ata: number;
};

function skill(
  name: string,
  position: string,
  skills: Skills,
  condition?: 'MAL_CONDICIONADO',
) {
  return { name, position, ...skills, condition };
}

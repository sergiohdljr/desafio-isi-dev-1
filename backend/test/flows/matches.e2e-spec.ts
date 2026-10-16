import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague, resetLeague } from '../league-app.js';
import {
  appOf,
  buyPlayer,
  createClub,
  createPlayer,
  prismaOf,
  regular,
} from './api.js';

const squad = [
  ['Goleiro Alfa', 'GOL'],
  ['Zagueiro Beta', 'ZAG'],
  ['Lateral Gama', 'LAT'],
  ['Meia Delta', 'MEI'],
  ['Ataque Épsilon', 'ATA'],
] as const;

async function hireLine(
  app: NestFastifyApplication,
  clubId: number,
  prefix: string,
) {
  const ids: number[] = [];
  for (const [name, position] of squad) {
    const player = await createPlayer(app, regular(`${prefix} ${name}`, position));
    await buyPlayer(app, player.id, clubId).expect(200);
    ids.push(player.id);
  }
  return ids;
}

describe('Escalação e partidas', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await openLeague();
  });

  beforeEach(async () => {
    await resetLeague(app);
  });

  afterAll(async () => {
    await closeLeague(app);
  });

  it('nasce sem escalação, grava uma formação válida sem mexer no caixa e recusa a inválida', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const empty = await appOf(app).get(`/api/v1/clubs/${club.id}/lineup`).expect(200);
    expect(empty.body).toMatchObject({
      formation: null,
      players: [],
      complete: false,
    });

    const ids = await hireLine(app, club.id, 'Casa');
    const before = await appOf(app).get(`/api/v1/clubs/${club.id}`).expect(200);

    const saved = await appOf(app).put(`/api/v1/clubs/${club.id}/lineup`).send({
      formation: '2-1-1',
      player_ids: [...ids].reverse(),
    });
    expect(saved.status).toBe(200);
    expect(saved.body.complete).toBe(true);
    expect(saved.body.formation).toBe('2-1-1');
    expect(saved.body.players.map((player: { position: string }) => player.position)).toEqual([
      'GOL',
      'ZAG',
      'LAT',
      'MEI',
      'ATA',
    ]);

    const after = await appOf(app).get(`/api/v1/clubs/${club.id}`).expect(200);
    expect(after.body.cash).toBe(before.body.cash);

    const other = await createClub(app, 'Zulu FC', 'ZFC');
    const outsider = await createPlayer(app, regular('Fora Nome', 'ATA'));
    await buyPlayer(app, outsider.id, other.id).expect(200);

    const mismatch = await appOf(app).put(`/api/v1/clubs/${club.id}/lineup`).send({
      formation: '2-2',
      player_ids: ids,
    });
    expect(mismatch.status).toBe(409);
    const sick = await createPlayer(app, regular('Doente Nome', 'MEI'));
    await buyPlayer(app, sick.id, club.id).expect(200);
    await appOf(app)
      .patch(`/api/v1/players/${sick.id}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);
    const ill = await appOf(app).put(`/api/v1/clubs/${club.id}/lineup`).send({
      formation: '2-1-1',
      player_ids: [ids[0], ids[1], ids[2], sick.id, ids[4]],
    });
    expect(ill.status).toBe(409);
    const away = await appOf(app).put(`/api/v1/clubs/${club.id}/lineup`).send({
      formation: '2-1-1',
      player_ids: [ids[0], ids[1], ids[2], ids[3], outsider.id],
    });
    expect(away.status).toBe(409);

    const still = await appOf(app).get(`/api/v1/clubs/${club.id}/lineup`).expect(200);
    expect(still.body.formation).toBe('2-1-1');
    expect(still.body.players).toHaveLength(5);

    await appOf(app)
      .put(`/api/v1/clubs/${club.id}/lineup`)
      .send({ formation: '9-9', player_ids: ids })
      .expect(400);
  });

  it('tira o titular vendido ou doente e não o recoloca quando deixa de estar doente', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const ids = await hireLine(app, club.id, 'Casa');
    await appOf(app)
      .put(`/api/v1/clubs/${club.id}/lineup`)
      .send({ formation: '2-1-1', player_ids: ids })
      .expect(200);

    await appOf(app)
      .patch(`/api/v1/players/${ids[4]}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(200);
    const sick = await appOf(app).get(`/api/v1/clubs/${club.id}/lineup`).expect(200);
    expect(sick.body.formation).toBe('2-1-1');
    expect(sick.body.complete).toBe(false);
    expect(sick.body.players.map((player: { id: number }) => player.id)).not.toContain(
      ids[4],
    );

    await appOf(app)
      .patch(`/api/v1/players/${ids[4]}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    const recovered = await appOf(app).get(`/api/v1/clubs/${club.id}/lineup`).expect(200);
    expect(recovered.body.complete).toBe(false);
    expect(
      recovered.body.players.map((player: { id: number }) => player.id),
    ).not.toContain(ids[4]);

    await appOf(app).post(`/api/v1/players/${ids[3]}/sell`).expect(200);
    const sold = await appOf(app).get(`/api/v1/clubs/${club.id}/lineup`).expect(200);
    expect(sold.body.formation).toBe('2-1-1');
    expect(sold.body.players.map((player: { id: number }) => player.id)).not.toContain(
      ids[3],
    );
  });

  it('joga a partida com as duas escalações, grava os 6 duelos e recusa sem gravar', async () => {
    const home = await createClub(app, 'Águias FC', 'AFC');
    const away = await createClub(app, 'Delta FC', 'DFC');
    const homeIds = await hireLine(app, home.id, 'Casa');
    const awayIds = await hireLine(app, away.id, 'Visita');
    await appOf(app)
      .put(`/api/v1/clubs/${home.id}/lineup`)
      .send({ formation: '2-1-1', player_ids: homeIds })
      .expect(200);
    await appOf(app)
      .put(`/api/v1/clubs/${away.id}/lineup`)
      .send({ formation: '2-1-1', player_ids: awayIds })
      .expect(200);

    const cashBefore = (await appOf(app).get(`/api/v1/clubs/${home.id}`)).body.cash;
    const played = await appOf(app).post('/api/v1/matches').send({
      home_club_id: home.id,
      away_club_id: away.id,
    });
    expect(played.status).toBe(201);
    expect(played.headers.location).toBe(`/api/v1/matches/${played.body.id}`);
    expect(played.body.duels).toHaveLength(6);
    expect((await appOf(app).get(`/api/v1/clubs/${home.id}`)).body.cash).toBe(cashBefore);
    expect(await prismaOf(app).partidas.count()).toBe(1);
    expect(await prismaOf(app).duelos_partida.count()).toBe(6);

    await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: home.id, away_club_id: home.id })
      .expect(400);
    await appOf(app).post('/api/v1/matches').send({}).expect(400);
    await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: 999999, away_club_id: away.id })
      .expect(404);

    const idle = await createClub(app, 'Zulu FC', 'ZFC');
    await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: home.id, away_club_id: idle.id })
      .expect(409);
    expect(await prismaOf(app).partidas.count()).toBe(1);
  });

  it('lista as partidas da mais recente e devolve os duelos gravados mesmo depois de editar o jogador', async () => {
    const home = await createClub(app, 'Águias FC', 'AFC');
    const away = await createClub(app, 'Delta FC', 'DFC');
    const third = await createClub(app, 'Gama SC', 'GSC');
    const homeIds = await hireLine(app, home.id, 'Casa');
    const awayIds = await hireLine(app, away.id, 'Visita');
    const thirdIds = await hireLine(app, third.id, 'Terceiro');
    for (const [clubId, ids] of [
      [home.id, homeIds],
      [away.id, awayIds],
      [third.id, thirdIds],
    ] as const) {
      await appOf(app)
        .put(`/api/v1/clubs/${clubId}/lineup`)
        .send({ formation: '2-1-1', player_ids: ids })
        .expect(200);
    }

    const first = await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: home.id, away_club_id: away.id })
      .expect(201);
    const second = await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: away.id, away_club_id: third.id })
      .expect(201);

    const listed = await appOf(app).get('/api/v1/matches').expect(200);
    expect(listed.body.map((match: { id: number }) => match.id)).toEqual([
      second.body.id,
      first.body.id,
    ]);

    const attacker = first.body.duels[0].attacker.player_name;
    await appOf(app).put(`/api/v1/players/${homeIds[4]}`).send({
      name: 'Nome Trocado',
      position: 'ATA',
      agility: 50,
      age: 26,
    }).expect(200);

    const loaded = await appOf(app).get(`/api/v1/matches/${first.body.id}`).expect(200);
    expect(loaded.body.duels).toHaveLength(6);
    expect(loaded.body.duels[0].attacker.player_name).toBe(attacker);
  });

  it('classifica todos os clubes, inclusive quem não jogou, por pontos, saldo, gols e nome', async () => {
    const alpha = await createClub(app, 'Alpha FC', 'AFC');
    const meio = await createClub(app, 'Meio FC', 'MFC');
    const zulu = await createClub(app, 'Zulu FC', 'ZFC');
    const alphaIds = await hireLine(app, alpha.id, 'Alpha');
    const zuluIds = await hireLine(app, zulu.id, 'Zulu');
    await appOf(app)
      .put(`/api/v1/clubs/${alpha.id}/lineup`)
      .send({ formation: '2-1-1', player_ids: alphaIds })
      .expect(200);
    await appOf(app)
      .put(`/api/v1/clubs/${zulu.id}/lineup`)
      .send({ formation: '2-1-1', player_ids: zuluIds })
      .expect(200);
    await appOf(app)
      .post('/api/v1/matches')
      .send({ home_club_id: alpha.id, away_club_id: zulu.id })
      .expect(201);

    const table = await appOf(app).get('/api/v1/standings').expect(200);
    expect(table.body.map((row: { position: number }) => row.position)).toEqual([1, 2, 3]);
    expect(table.body.map((row: { club_name: string }) => row.club_name)).toEqual([
      'Alpha FC',
      'Zulu FC',
      'Meio FC',
    ]);
    expect(table.body[2]).toMatchObject({
      played: 0,
      points: 0,
      goal_difference: 0,
      goals_for: 0,
    });
    expect(table.body[0].points).toBeGreaterThanOrEqual(table.body[1].points);
  });
});

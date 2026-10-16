import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague, resetLeague } from '../league-app.js';
import { appOf, buyPlayer, createClub, createPlayer, prismaOf } from './api.js';

describe('Jogadores', () => {
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

  it('cadastra um jogador e devolve o overall calculado e o valor base gravado', async () => {
    const created = await createPlayer(app);
    const stored = await prismaOf(app).jogadores.findUnique({
      where: { id: created.id },
    });

    expect(created.overall).toBe(73);
    expect(created.base_value).toBe(36);
    expect(Number(stored?.valor_base)).toBe(36);

    const loaded = await appOf(app)
      .get(`/api/v1/players/${created.id}`)
      .expect(200);
    expect(loaded.body).toMatchObject({
      overall: 73,
      base_value: 36,
      market_value: 36,
    });
  });

  it('muda o valor de mercado ao alterar a condição e mantém o valor base', async () => {
    const created = await createPlayer(app);

    const changed = await appOf(app)
      .patch(`/api/v1/players/${created.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);

    expect(changed.body.base_value).toBe(36);
    expect(changed.body.market_value).toBe(30.6);

    const loaded = await appOf(app)
      .get(`/api/v1/players/${created.id}`)
      .expect(200);
    expect(loaded.body).toMatchObject({
      condition: 'MAL_CONDICIONADO',
      base_value: 36,
      market_value: 30.6,
    });
  });

  it('edita nome, posição, agilidade e idade, e recusa idade menor ou troca de posição no elenco', async () => {
    const created = await createPlayer(app);

    const edited = await appOf(app).put(`/api/v1/players/${created.id}`).send({
      name: 'Ataque Novo',
      position: 'ATA',
      agility: 40,
      age: 32,
    });
    expect(edited.status).toBe(200);
    expect(edited.body).toMatchObject({
      name: 'Ataque Novo',
      position: 'ATA',
      agility: 40,
      age: 32,
      potential: 86,
      base_value: 36,
    });

    const younger = await appOf(app).put(`/api/v1/players/${created.id}`).send({
      name: 'Ataque Novo',
      position: 'ATA',
      agility: 40,
      age: 31,
    });
    expect(younger.status).toBe(409);
    expect(
      (await appOf(app).get(`/api/v1/players/${created.id}`)).body.age,
    ).toBe(32);

    const club = await createClub(app, 'Águias FC', 'AFC');
    const hired = await createPlayer(app, { name: 'No Elenco' });
    await buyPlayer(app, hired.id, club.id).expect(200);

    const moved = await appOf(app).put(`/api/v1/players/${hired.id}`).send({
      name: 'No Elenco',
      position: 'ATA',
      agility: 50,
      age: 25,
    });
    expect(moved.status).toBe(409);
    expect(
      (await appOf(app).get(`/api/v1/players/${hired.id}`)).body.position,
    ).toBe('MEI');
  });

  it('pagina depois do filtro, devolve a página vazia além da última e recusa filtro inválido', async () => {
    await createPlayer(app, { name: 'Ana Lima' });
    await createPlayer(app, { name: 'Bruno Dias' });

    const filtered = await appOf(app)
      .get('/api/v1/players')
      .query({ search: 'ana', limit: 10, page: 1 })
      .expect(200);
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0].name).toBe('Ana Lima');
    expect(filtered.body.meta).toMatchObject({
      total_items: 1,
      total_pages: 1,
    });

    const beyond = await appOf(app)
      .get('/api/v1/players')
      .query({ page: 2, limit: 10 })
      .expect(200);
    expect(beyond.body.data).toEqual([]);
    expect(beyond.body.meta).toMatchObject({
      total_items: 2,
      total_pages: 1,
    });

    await appOf(app).get('/api/v1/players').query({ sort: 'nome' }).expect(400);
  });

  it('exclui o jogador livre com 204, preserva a linha e responde 404 nos demais endpoints', async () => {
    const created = await createPlayer(app);

    const deleted = await appOf(app)
      .delete(`/api/v1/players/${created.id}`)
      .expect(204);
    expect(deleted.text).toBe('');

    const row = await prismaOf(app).jogadores.findUnique({
      where: { id: created.id },
    });
    expect(row?.excluido_em).toBeInstanceOf(Date);

    await appOf(app).get(`/api/v1/players/${created.id}`).expect(404);
    await appOf(app)
      .put(`/api/v1/players/${created.id}`)
      .send({ name: 'Outro Nome', position: 'MEI', agility: 50, age: 25 })
      .expect(404);
    await appOf(app)
      .patch(`/api/v1/players/${created.id}/condition`)
      .send({ condition: 'DOENTE' })
      .expect(404);
    await appOf(app).delete(`/api/v1/players/${created.id}`).expect(404);

    const listed = await appOf(app).get('/api/v1/players').expect(200);
    expect(listed.body.data).toEqual([]);
    expect(listed.body.meta.total_items).toBe(0);
  });

  it('recusa excluir jogador do elenco e não preenche excluido_em', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const player = await createPlayer(app);
    await buyPlayer(app, player.id, club.id).expect(200);

    await appOf(app).delete(`/api/v1/players/${player.id}`).expect(409);

    const row = await prismaOf(app).jogadores.findUnique({
      where: { id: player.id },
    });
    expect(row?.excluido_em).toBeNull();
  });
});

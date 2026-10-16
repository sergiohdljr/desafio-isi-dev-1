import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague, resetLeague } from '../league-app.js';
import { appOf, buyPlayer, createClub, createPlayer, prismaOf } from './api.js';

describe('Clubes', () => {
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

  it('cria o clube com 300 no caixa, elenco vazio e patrimônio igual ao caixa', async () => {
    const created = await createClub(app, 'Águias FC', 'AFC');

    expect(created).toMatchObject({
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    });

    const detail = await appOf(app)
      .get(`/api/v1/clubs/${created.id}`)
      .expect(200);
    expect(detail.body.players).toEqual([]);
    expect(detail.body.net_worth).toBe(300);
  });

  it('recusa nome e sigla repetidos e o 21º clube, e aceita nome que só muda o acento', async () => {
    await createClub(app, 'Águias FC', 'AFC');

    const sameName = await appOf(app)
      .post('/api/v1/clubs')
      .send({ name: 'águias fc', acronym: 'AGU' });
    expect(sameName.status).toBe(409);

    const accent = await createClub(app, 'Aguias FC', 'AGF');
    expect(accent.name).toBe('Aguias FC');

    const sameAcronym = await appOf(app)
      .post('/api/v1/clubs')
      .send({ name: 'Alfa FC', acronym: 'AFC' });
    expect(sameAcronym.status).toBe(409);
    expect(await prismaOf(app).clubes.count()).toBe(2);

    for (let index = 0; index < 18; index += 1) {
      const letter = String.fromCharCode(65 + index);
      await createClub(app, `Clube ${letter} Norte`, `C${letter}N`);
    }
    expect(await prismaOf(app).clubes.count()).toBe(20);

    const twentyFirst = await appOf(app)
      .post('/api/v1/clubs')
      .send({ name: 'Clube Extra', acronym: 'CEX' });
    expect(twentyFirst.status).toBe(409);
    expect(await prismaOf(app).clubes.count()).toBe(20);
  });

  it('ordena a lista por nome ou pelo patrimônio calculado, desempatando por nome e id', async () => {
    const aguias = await createClub(app, 'Águias FC', 'AFC');
    const plain = await createClub(app, 'Aguias FC', 'AGF');
    const zulu = await createClub(app, 'Zulu FC', 'ZFC');
    const player = await createPlayer(app, { name: 'Reforco Caro' });
    await buyPlayer(app, player.id, zulu.id).expect(200);

    const byName = await appOf(app)
      .get('/api/v1/clubs')
      .query({ sort: 'name' })
      .expect(200);
    expect(byName.body.map((club: { id: number }) => club.id)).toEqual([
      aguias.id,
      plain.id,
      zulu.id,
    ]);

    const byWorth = await appOf(app)
      .get('/api/v1/clubs')
      .query({ sort: 'net_worth_asc' })
      .expect(200);
    expect(byWorth.body.map((club: { name: string }) => club.name)).toEqual([
      'Zulu FC',
      'Águias FC',
      'Aguias FC',
    ]);
    expect(byWorth.body[0].net_worth).toBeLessThan(300);
    expect(byWorth.body[1].net_worth).toBe(300);
    expect(byWorth.body[2].net_worth).toBe(300);
  });

  it('devolve o elenco na ordem de posição, o contrato e o patrimônio na consulta do clube', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const attack = await createPlayer(app, {
      name: 'Ataque Beta',
      position: 'ATA',
    });
    const keeper = await createPlayer(app, {
      name: 'Goleiro Alfa',
      position: 'GOL',
    });
    await buyPlayer(app, attack.id, club.id).expect(200);
    await buyPlayer(app, keeper.id, club.id).expect(200);

    const detail = await appOf(app).get(`/api/v1/clubs/${club.id}`).expect(200);
    expect(
      detail.body.players.map((player: { name: string }) => player.name),
    ).toEqual(['Goleiro Alfa', 'Ataque Beta']);
    expect(detail.body.players[0].contract.purchase_value).toBe(
      detail.body.players[0].market_value,
    );
    expect(detail.body.players[0].contract.loyalty_until).toBe(
      '2027-04-01T15:00:00-03:00',
    );
    const squad = detail.body.players.reduce(
      (sum: number, player: { market_value: number }) =>
        sum + player.market_value,
      0,
    );
    expect(detail.body.squad_value).toBe(squad);
    expect(detail.body.net_worth).toBe(detail.body.cash + squad);
  });
});

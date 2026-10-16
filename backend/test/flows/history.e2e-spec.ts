import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague, resetLeague } from '../league-app.js';
import { appOf, buyPlayer, createClub, createPlayer } from './api.js';

const zeroSummary = {
  total_spent: 0,
  total_received: 0,
  total_fees: 0,
  total_penalties: 0,
  total_profit: 0,
};

describe('Histórico e CSV', () => {
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

  it('lista da mais recente para a mais antiga, fecha o caixa e mantém o nome gravado', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const player = await createPlayer(app);
    await buyPlayer(app, player.id, club.id).expect(200);
    await appOf(app).post(`/api/v1/players/${player.id}/sell`).expect(200);
    await appOf(app)
      .put(`/api/v1/players/${player.id}`)
      .send({
        name: 'Nome Novo',
        position: 'MEI',
        agility: 50,
        age: 25,
      })
      .expect(200);

    const history = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .expect(200);
    expect(history.body.data.map((row: { type: string }) => row.type)).toEqual([
      'VENDA',
      'COMPRA',
    ]);
    expect(history.body.data[1].player_name).toBe('Meia Lua');

    const cashChange = history.body.data.reduce(
      (sum: number, row: { cash_change: number }) => sum + row.cash_change,
      0,
    );
    const detail = await appOf(app).get(`/api/v1/clubs/${club.id}`).expect(200);
    expect(detail.body.cash).toBeCloseTo(300 + cashChange, 2);
  });

  it('filtra por tipo e jogador, zera o resumo sem transações e responde 400 ou 404', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const empty = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .expect(200);
    expect(empty.body.data).toEqual([]);
    expect(empty.body.summary).toEqual(zeroSummary);

    const player = await createPlayer(app);
    const other = await createPlayer(app, { name: 'Outro Nome' });
    await buyPlayer(app, player.id, club.id).expect(200);
    await appOf(app).post(`/api/v1/players/${player.id}/sell`).expect(200);

    const sales = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .query({ type: 'VENDA' })
      .expect(200);
    expect(sales.body.data).toHaveLength(1);
    expect(sales.body.data[0].type).toBe('VENDA');
    expect(sales.body.summary.total_spent).toBe(0);

    const none = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .query({ player_id: other.id })
      .expect(200);
    expect(none.body.data).toEqual([]);
    expect(none.body.summary).toEqual(zeroSummary);

    await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .query({ type: 'TROCA' })
      .expect(400);
    await appOf(app).get('/api/v1/clubs/999999/transactions').expect(404);
    await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .query({ player_id: 999999 })
      .expect(404);
  });

  it('exporta o CSV na mesma ordem, só o cabeçalho sem transações, e o erro em JSON', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const header =
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

    const empty = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions/export`)
      .expect(200)
      .expect('Content-Type', /text\/csv/);
    expect(empty.text.charCodeAt(0)).not.toBe(0xfeff);
    expect(empty.text).toBe(`${header}\n`);

    const player = await createPlayer(app);
    await buyPlayer(app, player.id, club.id).expect(200);
    await appOf(app).post(`/api/v1/players/${player.id}/sell`).expect(200);

    const csv = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions/export`)
      .expect(200);
    const lines = csv.text.trimEnd().split('\n');
    expect(lines[0]).toBe(header);
    expect(lines[1]).toContain(';VENDA;');
    expect(lines[2]).toContain(';COMPRA;');
    expect(csv.text.endsWith('\n')).toBe(true);
    expect(csv.text.includes('\r')).toBe(false);

    const sales = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions/export`)
      .query({ type: 'VENDA' })
      .expect(200);
    expect(sales.text.trimEnd().split('\n')).toHaveLength(2);

    const invalid = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions/export`)
      .query({ type: 'TROCA' })
      .expect(400);
    expect(invalid.headers['content-type']).toContain('application/json');
  });
});

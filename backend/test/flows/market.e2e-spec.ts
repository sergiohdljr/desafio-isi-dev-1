import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague, resetLeague } from '../league-app.js';
import { appOf, buyPlayer, createClub, createPlayer, prismaOf } from './api.js';

const loyaltyUntil = '2027-04-01T15:00-03:00';

describe('Compra', () => {
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

  it('compra o jogador livre pelo valor de mercado, abre o contrato e grava a COMPRA', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const player = await createPlayer(app);

    const bought = await buyPlayer(app, player.id, club.id).expect(200);
    expect(bought.body).toMatchObject({
      type: 'COMPRA',
      value: player.market_value,
      contract: {
        purchase_value: player.market_value,
        status: 'ATIVO',
        loyalty_until: '2027-04-01T15:00:00-03:00',
      },
      club_cash: 300 + bought.body.cash_change,
    });
    expect(bought.body.cash_change).toBe(
      -(player.market_value + bought.body.fee),
    );

    const hired = await appOf(app)
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(hired.body.club_id).toBe(club.id);

    const contract = await prismaOf(app).contratos.findFirst({
      where: { jogador_id: player.id },
    });
    expect(contract?.situacao).toBe('ATIVO');
    expect(Number(contract?.valor_compra)).toBe(player.market_value);

    const history = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .expect(200);
    expect(history.body.data).toHaveLength(1);
    expect(history.body.data[0].type).toBe('COMPRA');
  });

  it('recusa custo acima da metade do caixa, jogador com clube e recompra pelo vendedor, sem gravar', async () => {
    const seller = await createClub(app, 'Águias FC', 'AFC');
    const buyer = await createClub(app, 'Zulu FC', 'ZFC');
    const expensive = await createPlayer(app, {
      name: 'Craque Caro',
      position: 'ATA',
      pace: 99,
      shooting: 99,
      passing: 99,
      dribbling: 99,
      defending: 4,
      physical: 80,
      potential: 99,
    });

    const overHalf = await buyPlayer(app, expensive.id, seller.id);
    expect(overHalf.status).toBe(409);
    expect(await prismaOf(app).transacoes.count()).toBe(0);
    expect(await prismaOf(app).contratos.count()).toBe(0);

    const player = await createPlayer(app, { name: 'Meia Livre' });
    await buyPlayer(app, player.id, seller.id).expect(200);
    const secondClub = await buyPlayer(app, player.id, buyer.id);
    expect(secondClub.status).toBe(409);
    expect(await prismaOf(app).contratos.count()).toBe(1);

    await appOf(app).post(`/api/v1/players/${player.id}/sell`).expect(200);
    const dealsAfterSale = await prismaOf(app).transacoes.count();
    const rebuy = await buyPlayer(app, player.id, seller.id);
    expect(rebuy.status).toBe(409);
    expect(await prismaOf(app).transacoes.count()).toBe(dealsAfterSale);

    const elsewhere = await buyPlayer(app, player.id, buyer.id);
    expect(elsewhere.status).toBe(200);
  });

  it('responde 404 para jogador ou clube inexistente e 400 para corpo inválido', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const player = await createPlayer(app);

    await appOf(app)
      .post('/api/v1/players/999999/buy')
      .send({ club_id: club.id, loyalty_until: loyaltyUntil })
      .expect(404);
    await appOf(app)
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: 999999, loyalty_until: loyaltyUntil })
      .expect(404);
    await appOf(app)
      .post(`/api/v1/players/${player.id}/buy`)
      .send({})
      .expect(400);
    expect(await prismaOf(app).transacoes.count()).toBe(0);
  });
});

describe('Venda', () => {
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

  it('vende o jogador do elenco, credita o caixa, encerra o contrato e grava a VENDA', async () => {
    const club = await createClub(app, 'Águias FC', 'AFC');
    const player = await createPlayer(app);
    const bought = await buyPlayer(app, player.id, club.id).expect(200);

    const sold = await appOf(app)
      .post(`/api/v1/players/${player.id}/sell`)
      .expect(200);
    expect(sold.body.type).toBe('VENDA');
    expect(sold.body.club_cash).toBeCloseTo(
      bought.body.club_cash + sold.body.cash_change,
      2,
    );
    expect(sold.body.profit).toBe(sold.body.value - sold.body.purchase_value);
    expect(['ENCERRADO', 'RESCINDIDO']).toContain(sold.body.contract_status);

    const freed = await appOf(app)
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect(freed.body.club_id).toBeNull();

    const contract = await prismaOf(app).contratos.findFirst({
      where: { jogador_id: player.id },
    });
    expect(contract?.situacao).not.toBe('ATIVO');

    const history = await appOf(app)
      .get(`/api/v1/clubs/${club.id}/transactions`)
      .expect(200);
    expect(history.body.data[0]).toMatchObject({
      type: 'VENDA',
      penalty: sold.body.penalty,
      fee: sold.body.fee,
      profit: sold.body.profit,
      cash_change: sold.body.cash_change,
    });
  });

  it('recusa vender jogador livre e não grava a venda', async () => {
    const player = await createPlayer(app);

    await appOf(app).post(`/api/v1/players/${player.id}/sell`).expect(409);
    expect(await prismaOf(app).transacoes.count()).toBe(0);
  });
});

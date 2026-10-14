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
  position: 'MEI' as const,
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

describe('Market export', () => {
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

  it('downloads the history as CSV in the same order, without a BOM', async () => {
    const prisma = app.get(PrismaService);
    const clubId = await createClub('Águias FC', 'AFC');
    const playerId = await createPlayer('Meia Lua', '37.00');
    await buy(playerId, clubId);
    await prisma.jogadores.update({
      where: { id: playerId },
      data: { valor_base: '40.00' },
    });
    await prisma.contratos.updateMany({
      where: { jogador_id: playerId, situacao: 'ATIVO' },
      data: {
        fidelidade_ate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      },
    });
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/sell`)
      .expect(200);
    const rows = await prisma.transacoes.findMany({
      where: { clube_id: clubId },
    });
    for (const row of rows) {
      await prisma.transacoes.update({
        where: { id: row.id },
        data: {
          criado_em:
            row.tipo === 'VENDA'
              ? new Date('2026-11-05T19:40:00.000Z')
              : new Date('2026-11-02T13:15:00.000Z'),
        },
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions/export`)
      .expect(200)
      .expect('Content-Type', /text\/csv/);

    expect(response.text.charCodeAt(0)).not.toBe(0xfeff);
    expect(response.text.endsWith('\n')).toBe(true);
    expect(response.text.includes('\r')).toBe(false);
    expect(response.text).toBe(
      [
        'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa',
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70',
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85',
        '',
      ].join('\n'),
    );
  });

  it('quotes names with a semicolon or a quote and filters like the history', async () => {
    const clubId = await createClub('Aspas FC', 'ASF');
    const quoted = await createPlayer('Zé "Foguete" Lima', '10.00');
    const plain = await createPlayer('Ana; Lima', '10.00');
    await buy(quoted, clubId);
    await buy(plain, clubId);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions/export`)
      .query({ type: 'COMPRA', player_id: String(quoted) })
      .expect(200);
    expect(response.text).toContain('"Zé ""Foguete"" Lima"');
    expect(response.text).not.toContain('Ana; Lima');
  });

  it('returns only the header when the club has no deals', async () => {
    const clubId = await createClub('Vazio FC', 'VFC');
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions/export`)
      .expect(200);
    expect(response.text).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });

  it('keeps filter and lookup errors in JSON', async () => {
    const clubId = await createClub('Erro FC', 'EFC');
    const invalid = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions/export`)
      .query({ type: 'venda' })
      .expect(400)
      .expect('Content-Type', /application\/json/);
    expect(invalid.body.message.length).toBeGreaterThan(0);

    const missingClub = await request(app.getHttpServer())
      .get('/api/v1/clubs/999999/transactions/export')
      .expect(404)
      .expect('Content-Type', /application\/json/);
    expect(missingClub.body.message.length).toBeGreaterThan(0);

    const missingPlayer = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${clubId}/transactions/export`)
      .query({ player_id: '999999' })
      .expect(404)
      .expect('Content-Type', /application\/json/);
    expect(missingPlayer.body.message.length).toBeGreaterThan(0);
  });

  async function createClub(name: string, acronym: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return response.body.id;
  }

  async function createPlayer(name: string, base: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ ...meia, name })
      .expect(201);
    await app.get(PrismaService).jogadores.update({
      where: { id: response.body.id },
      data: { valor_base: base },
    });
    return response.body.id;
  }

  async function buy(playerId: number, clubId: number) {
    await request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send({ club_id: clubId, loyalty_until: '2027-06-15T10:15-03:00' })
      .expect(200);
  }
});

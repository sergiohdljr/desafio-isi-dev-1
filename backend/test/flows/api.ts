import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service.js';

const loyaltyUntil = '2027-04-01T15:00-03:00';

export const pricedMeia = {
  name: 'Meia Lua',
  position: 'MEI' as const,
  agility: 50,
  age: 25,
  pace: 68,
  shooting: 65,
  passing: 80,
  dribbling: 78,
  defending: 52,
  physical: 60,
  potential: 86,
};

export function appOf(app: NestFastifyApplication) {
  return request(app.getHttpServer());
}

export function prismaOf(app: NestFastifyApplication): PrismaService {
  return app.get(PrismaService);
}

export async function createPlayer(
  app: NestFastifyApplication,
  overrides: Record<string, unknown> = {},
) {
  const response = await appOf(app)
    .post('/api/v1/players')
    .send({ ...pricedMeia, ...overrides })
    .expect(201);
  return response.body as {
    id: number;
    name: string;
    position: string;
    agility: number;
    age: number;
    base_value: number;
    market_value: number;
    potential: number;
    overall: number;
    condition: string;
    club_id: number | null;
  };
}

export async function createClub(
  app: NestFastifyApplication,
  name: string,
  acronym: string,
) {
  const response = await appOf(app)
    .post('/api/v1/clubs')
    .send({ name, acronym })
    .expect(201);
  return response.body as {
    id: number;
    name: string;
    acronym: string;
    cash: number;
    squad_value: number;
    net_worth: number;
  };
}

export function buyPlayer(
  app: NestFastifyApplication,
  playerId: number,
  clubId: number,
) {
  return appOf(app).post(`/api/v1/players/${playerId}/buy`).send({
    club_id: clubId,
    loyalty_until: loyaltyUntil,
  });
}

export function regular(name: string, position: string) {
  return {
    name,
    position,
    agility: 50,
    age: 25,
    pace: 60,
    shooting: 60,
    passing: 60,
    dribbling: 60,
    defending: 60,
    physical: 60,
    potential: 60,
  };
}

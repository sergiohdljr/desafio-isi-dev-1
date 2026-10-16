import type { z } from 'zod';
import { resourceIdSchema } from '../common/validation/resource-id.js';
import { clubListQuerySchema } from '../modules/clubs/infra/http/input/club-list-query.schema.js';
import { createClubSchema } from '../modules/clubs/infra/http/dto/create-club.schema.js';
import { lineupSchema } from '../modules/league/infra/http/dto/lineup.schema.js';
import { playMatchSchema } from '../modules/league/infra/http/dto/play-match.schema.js';
import { matchListQuerySchema } from '../modules/league/infra/http/input/match-list-query.schema.js';
import { buyPlayerSchema } from '../modules/market/infra/http/dto/buy-player.schema.js';
import { transactionQuerySchema } from '../modules/market/infra/http/input/transaction-query.schema.js';
import { createPlayerSchema } from '../modules/players/infra/http/dto/create-player.schema.js';
import { updateConditionSchema } from '../modules/players/infra/http/dto/update-condition.schema.js';
import { updatePlayerSchema } from '../modules/players/infra/http/dto/update-player.schema.js';
import { playerListQuerySchema } from '../modules/players/infra/http/input/player-list-query.schema.js';
import { toOpenApiSchema } from './json-schema.js';
import { responseSchemas } from './response-schemas.js';

type JsonObject = Record<string, unknown>;

const invalid = 'Dado ou parâmetro inválido.';
const missing = 'Recurso inexistente.';

const playerQueryNotes: Record<string, string> = {
  search: 'Nome, sem diferenciar maiúsculas e acentos, de 2 a 100 caracteres.',
  position: 'GOL, ZAG, LAT, MEI ou ATA.',
  condition: 'APTO, MAL_CONDICIONADO ou DOENTE.',
  free: 'true só livres; false só com clube.',
  club_id: 'Id de clube existente. Inexistente responde 404.',
  min_age: 'Inteiro de 16 a 45. Sozinho, a máxima assume 45.',
  max_age: 'Inteiro de 16 a 45. Sozinho, a mínima assume 16.',
  min_value: 'Decimal de 0 a 550, até 2 casas. Sozinho, a máxima assume 550.',
  max_value: 'Decimal de 0 a 550, até 2 casas. Sozinho, a mínima assume 0.',
  sort: 'Até dois de name, value_asc, value_desc, age_asc, age_desc e position, separados por vírgula e sem espaço. Padrão: name.',
  page: 'Inteiro a partir de 1. Padrão: 1.',
  limit: 'Inteiro de 1 a 50. Padrão: 10.',
};

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Liga',
    version: '1.0.0',
    description:
      'Campo desconhecido no corpo é ignorado. Id inválido na URL responde 404. Dado inválido responde 400. Regra de negócio responde 409.',
  },
  tags: [
    { name: 'Jogadores' },
    { name: 'Clubes' },
    { name: 'Mercado' },
    { name: 'Liga' },
  ],
  paths: {
    '/api/v1/players': {
      get: operation({
        tags: ['Jogadores'],
        summary: 'Listar jogadores',
        description:
          'Os filtros se combinam. min_age maior que max_age, min_value maior que max_value, ou free=true com club_id responde 400.',
        parameters: queryParameters(playerListQuerySchema, playerQueryNotes),
        responses: {
          '200': ok('PlayerList'),
          '400': failure(invalid),
          '404': failure('club_id inexistente.'),
        },
      }),
      post: operation({
        tags: ['Jogadores'],
        summary: 'Cadastrar jogador',
        description:
          'Exige nome, posição, agilidade, idade, os seis atributos e potencial. Nasce APTO e sem clube.',
        requestBody: jsonBody(createPlayerSchema),
        responses: {
          '201': created('Player'),
          '400': failure(invalid),
        },
      }),
    },
    '/api/v1/players/{id}': {
      get: operation({
        tags: ['Jogadores'],
        summary: 'Consultar jogador',
        parameters: [playerIdParameter()],
        responses: { '200': ok('Player'), '404': failure(missing) },
      }),
      put: operation({
        tags: ['Jogadores'],
        summary: 'Editar jogador',
        description: 'Envia nome, posição, agilidade e idade.',
        parameters: [playerIdParameter()],
        requestBody: jsonBody(updatePlayerSchema),
        responses: {
          '200': ok('Player'),
          '400': failure(invalid),
          '404': failure(missing),
          '409': failure(
            'Posição de um jogador que já tem clube, ou idade menor que a atual.',
          ),
        },
      }),
      delete: operation({
        tags: ['Jogadores'],
        summary: 'Excluir jogador livre',
        parameters: [playerIdParameter()],
        responses: {
          '204': { description: 'Excluído, sem corpo.' },
          '404': failure(missing),
          '409': failure('Jogador que está num clube.'),
        },
      }),
    },
    '/api/v1/players/{id}/condition': {
      patch: operation({
        tags: ['Jogadores'],
        summary: 'Alterar condição',
        description: 'Enviar a condição atual responde 200, sem mudança.',
        parameters: [playerIdParameter()],
        requestBody: jsonBody(updateConditionSchema),
        responses: {
          '200': ok('Player'),
          '400': failure('Condição ausente, nula ou fora da lista.'),
          '404': failure(missing),
          '409': failure('De DOENTE direto para APTO.'),
        },
      }),
    },
    '/api/v1/players/{id}/buy': {
      post: operation({
        tags: ['Mercado'],
        summary: 'Comprar jogador',
        description:
          'Envia club_id e loyalty_until, no horário de Brasília AAAA-MM-DDTHH:MM-03:00, depois da compra e até 1.095 dias.',
        parameters: [playerIdParameter()],
        requestBody: jsonBody(buyPlayerSchema),
        responses: {
          '200': ok('Purchase'),
          '400': failure(invalid),
          '404': failure('Jogador da URL ou club_id inexistente.'),
          '409': failure(
            'Jogador não livre, custo acima de 50% do caixa, elenco com 12, ou recompra pelo clube que já o vendeu.',
          ),
        },
      }),
    },
    '/api/v1/players/{id}/sell': {
      post: operation({
        tags: ['Mercado'],
        summary: 'Vender jogador',
        description: 'Não tem corpo. A venda é do clube atual do jogador.',
        parameters: [playerIdParameter()],
        responses: {
          '200': ok('Sale'),
          '404': failure(missing),
          '409': failure('Jogador livre.'),
        },
      }),
    },
    '/api/v1/clubs': {
      get: operation({
        tags: ['Clubes'],
        summary: 'Listar clubes',
        description: 'Array sem elenco.',
        parameters: queryParameters(clubListQuerySchema, {
          sort: 'name, net_worth_asc ou net_worth_desc. Padrão: name.',
        }),
        responses: {
          '200': ok('ClubList'),
          '400': failure(invalid),
        },
      }),
      post: operation({
        tags: ['Clubes'],
        summary: 'Cadastrar clube',
        description:
          'Envia nome e sigla. Começa com caixa 300.00. A sigla tem 3 letras do nome, a primeira é a primeira letra, e as três não são iguais.',
        requestBody: jsonBody(createClubSchema),
        responses: {
          '201': created('Club'),
          '400': failure('Nome ou sigla inválidos.'),
          '409': failure(
            'Nome ou sigla já usados, ou a liga já tem 20 clubes.',
          ),
        },
      }),
    },
    '/api/v1/clubs/{id}': {
      get: operation({
        tags: ['Clubes'],
        summary: 'Consultar clube',
        description: 'O detalhe inclui o elenco e o contrato de cada jogador.',
        parameters: [clubIdParameter()],
        responses: { '200': ok('ClubDetail'), '404': failure(missing) },
      }),
    },
    '/api/v1/clubs/{id}/lineup': {
      get: operation({
        tags: ['Liga'],
        summary: 'Consultar escalação',
        description:
          'Sem escalação: formation null, complete false e players vazio.',
        parameters: [clubIdParameter()],
        responses: { '200': ok('Lineup'), '404': failure(missing) },
      }),
      put: operation({
        tags: ['Liga'],
        summary: 'Escalar titulares',
        description:
          'Substitui a escalação inteira. Exige 1 GOL e os setores da formação. MAL_CONDICIONADO pode jogar. Não muda o caixa.',
        parameters: [clubIdParameter()],
        requestBody: jsonBody(lineupSchema),
        responses: {
          '200': ok('Lineup'),
          '400': failure(invalid),
          '404': failure('Clube ou jogador inexistente.'),
          '409': failure(
            'Jogador fora do elenco, DOENTE, ou posições que não fecham a formação.',
          ),
        },
      }),
    },
    '/api/v1/clubs/{id}/transactions': {
      get: operation({
        tags: ['Mercado'],
        summary: 'Consultar histórico',
        description:
          'Da mais recente para a mais antiga. O summary também respeita o filtro.',
        parameters: [
          clubIdParameter(),
          ...queryParameters(transactionQuerySchema, {
            type: 'Um ou mais de COMPRA e VENDA, separados por vírgula, sem espaço nem repetição.',
            player_id:
              'Transações desse jogador no clube. Inexistente ou excluído responde 404.',
          }),
        ],
        responses: {
          '200': ok('TransactionList'),
          '400': failure(invalid),
          '404': failure('Clube ou jogador do filtro inexistente.'),
        },
      }),
    },
    '/api/v1/clubs/{id}/transactions/export': {
      get: operation({
        tags: ['Mercado'],
        summary: 'Exportar histórico',
        description:
          'CSV separado por ponto e vírgula, decimal com vírgula. O erro continua JSON.',
        parameters: [
          clubIdParameter(),
          ...queryParameters(transactionQuerySchema, {
            type: 'Um ou mais de COMPRA e VENDA, separados por vírgula, sem espaço nem repetição.',
            player_id:
              'Transações desse jogador no clube. Inexistente ou excluído responde 404.',
          }),
        ],
        responses: {
          '200': {
            description: 'Histórico exportado.',
            content: {
              'text/csv': { schema: { type: 'string' } },
            },
          },
          '400': failure(invalid),
          '404': failure('Clube ou jogador do filtro inexistente.'),
        },
      }),
    },
    '/api/v1/matches': {
      get: operation({
        tags: ['Liga'],
        summary: 'Listar partidas',
        description: 'Sem os duelos, da mais recente para a mais antiga.',
        parameters: queryParameters(matchListQuerySchema, {
          club_id:
            'Partidas como mandante ou visitante. Inexistente responde 404.',
        }),
        responses: {
          '200': ok('MatchList'),
          '400': failure(invalid),
          '404': failure('Clube do filtro inexistente.'),
        },
      }),
      post: operation({
        tags: ['Liga'],
        summary: 'Jogar partida',
        description:
          'Envia home_club_id e away_club_id. Os dois iguais responde 400.',
        requestBody: jsonBody(playMatchSchema),
        responses: {
          '201': created('Match'),
          '400': failure(invalid),
          '404': failure('Clube inexistente.'),
          '409': failure('Escalação incompleta.'),
        },
      }),
    },
    '/api/v1/matches/{id}': {
      get: operation({
        tags: ['Liga'],
        summary: 'Consultar partida',
        description: 'Inclui os 6 duelos.',
        parameters: [pathParameter('id', 'Id da partida.')],
        responses: { '200': ok('Match'), '404': failure(missing) },
      }),
    },
    '/api/v1/standings': {
      get: operation({
        tags: ['Liga'],
        summary: 'Consultar classificação',
        description: 'Um item por clube, inclusive quem ainda não jogou.',
        responses: { '200': ok('StandingList') },
      }),
    },
  },
  components: {
    schemas: Object.fromEntries(
      Object.entries(responseSchemas).map(([name, schema]) => [
        name,
        toOpenApiSchema(schema),
      ]),
    ),
  },
};

function operation(definition: {
  tags: string[];
  summary: string;
  description?: string;
  parameters?: JsonObject[];
  requestBody?: JsonObject;
  responses: JsonObject;
}): JsonObject {
  return {
    tags: definition.tags,
    summary: definition.summary,
    ...(definition.description ? { description: definition.description } : {}),
    ...(definition.parameters ? { parameters: definition.parameters } : {}),
    ...(definition.requestBody ? { requestBody: definition.requestBody } : {}),
    responses: definition.responses,
  };
}

function jsonBody(schema: z.ZodType): JsonObject {
  return {
    required: true,
    content: {
      'application/json': { schema: toOpenApiSchema(schema) },
    },
  };
}

function queryParameters(
  schema: z.ZodType,
  notes: Record<string, string>,
): JsonObject[] {
  const json = toOpenApiSchema(schema);
  const properties = json.properties as Record<string, JsonObject>;
  const required = new Set((json.required as string[] | undefined) ?? []);
  return Object.entries(properties).map(([name, property]) => ({
    name,
    in: 'query',
    required: required.has(name),
    ...(notes[name] ? { description: notes[name] } : {}),
    schema: property,
  }));
}

function pathParameter(name: string, description: string): JsonObject {
  return {
    name,
    in: 'path',
    required: true,
    description,
    schema: toOpenApiSchema(resourceIdSchema),
  };
}

function playerIdParameter(): JsonObject {
  return pathParameter(
    'id',
    'Id do jogador. abc, 0, 01 ou acima de 2147483647 responde 404.',
  );
}

function clubIdParameter(): JsonObject {
  return pathParameter(
    'id',
    'Id do clube. abc, 0, 01 ou acima de 2147483647 responde 404.',
  );
}

function ok(schemaName: string, description = 'Sucesso.'): JsonObject {
  return {
    description,
    content: jsonRef(schemaName),
  };
}

function created(schemaName: string): JsonObject {
  return {
    description: 'Criado.',
    headers: {
      Location: {
        description: 'Caminho do recurso criado.',
        schema: { type: 'string' },
      },
    },
    content: jsonRef(schemaName),
  };
}

function failure(description: string): JsonObject {
  return {
    description,
    content: jsonRef('Error'),
  };
}

function jsonRef(schemaName: string): JsonObject {
  return {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schemaName}` },
    },
  };
}

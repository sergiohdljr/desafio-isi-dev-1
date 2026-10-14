import { openApiDocument } from './openapi-document.js';

type Response = {
  description?: string;
  content?: Record<string, { schema?: { $ref?: string } }>;
  headers?: { Location?: { schema: { type: string } } };
};

type Operation = {
  responses: Record<string, Response>;
  parameters?: Array<{
    name: string;
    schema?: { type?: string; enum?: string[] };
  }>;
  requestBody?: {
    content: {
      'application/json': {
        schema: { additionalProperties?: boolean; required?: string[] };
      };
    };
  };
};

const document = openApiDocument as unknown as {
  paths: Record<string, Record<string, Operation>>;
  components: {
    schemas: { Error: { properties: object; required: string[] } };
  };
};

const paths = document.paths;

function operation(path: string, method: string): Operation {
  const found = paths[path]?.[method];
  if (!found) {
    throw new Error(`${method} ${path} ausente`);
  }
  return found;
}

describe('OpenAPI document', () => {
  it('lists every route of the league', () => {
    expect(Object.keys(paths).sort()).toEqual(
      [
        '/api/v1/clubs',
        '/api/v1/clubs/{id}',
        '/api/v1/clubs/{id}/lineup',
        '/api/v1/clubs/{id}/transactions',
        '/api/v1/clubs/{id}/transactions/export',
        '/api/v1/matches',
        '/api/v1/matches/{id}',
        '/api/v1/players',
        '/api/v1/players/{id}',
        '/api/v1/players/{id}/buy',
        '/api/v1/players/{id}/condition',
        '/api/v1/players/{id}/sell',
        '/api/v1/standings',
      ].sort(),
    );
  });

  it('documents player filters as the query text the client sends', () => {
    const listed = operation('/api/v1/players', 'get');
    const search = listed.parameters?.find((item) => item.name === 'search');
    const free = listed.parameters?.find((item) => item.name === 'free');
    expect(search?.schema?.type).toBe('string');
    expect(free?.schema?.enum).toEqual(['true', 'false']);
  });

  it('describes the csv export and the json error', () => {
    const exported = operation('/api/v1/clubs/{id}/transactions/export', 'get');
    expect(exported.responses['200']?.content).toHaveProperty('text/csv');
    expect(
      exported.responses['400']?.content?.['application/json'].schema?.$ref,
    ).toBe('#/components/schemas/Error');

    const error = document.components.schemas.Error;
    expect(error.properties).toHaveProperty('message');
    expect(error.required).toContain('message');
  });

  it('keeps unknown request fields out of a closed object', () => {
    const created = operation('/api/v1/players', 'post');
    const schema = created.requestBody?.content['application/json'].schema;
    expect(schema?.additionalProperties).not.toBe(false);
    expect(schema?.required).toEqual(
      expect.arrayContaining(['name', 'position', 'age']),
    );
    expect(created.responses['201']?.headers?.Location?.schema).toEqual({
      type: 'string',
    });
    expect(
      operation('/api/v1/clubs', 'post').responses['201']?.headers?.Location,
    ).toBeDefined();
    expect(
      operation('/api/v1/matches', 'post').responses['201']?.headers?.Location,
    ).toBeDefined();
    expect(
      operation('/api/v1/players/{id}', 'delete').responses['204'],
    ).toEqual({
      description: 'Excluído, sem corpo.',
    });
  });
});

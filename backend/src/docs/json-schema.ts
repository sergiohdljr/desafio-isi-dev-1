import { z } from 'zod';

type JsonObject = Record<string, unknown>;

export function toOpenApiSchema(schema: z.ZodType): JsonObject {
  const json = z.toJSONSchema(schema, {
    io: 'input',
    unrepresentable: 'any',
    target: 'draft-2020-12',
  }) as JsonObject;
  delete json.$schema;
  dropClosedObjects(json);
  return json;
}

function dropClosedObjects(schema: JsonObject): void {
  if (schema.additionalProperties === false) {
    delete schema.additionalProperties;
  }
  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isJsonObject(item)) {
          dropClosedObjects(item);
        }
      }
    } else if (isJsonObject(value)) {
      dropClosedObjects(value);
    }
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const schemaPath = new URL(
  '../extensions/fable-friendly-ui/fable-profile.schema.json',
  import.meta.url,
);

test('Fable character profile schema documents an extensible version 2 payload', () => {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as {
    properties: { version: { const: number } };
    required: string[];
    additionalProperties: boolean;
  };

  assert.equal(schema.properties.version.const, 2);
  assert.deepEqual(
    new Set(schema.required),
    new Set(['version', 'identity', 'speech', 'relationship', 'roleplay']),
  );
  assert.equal(schema.additionalProperties, true);
});

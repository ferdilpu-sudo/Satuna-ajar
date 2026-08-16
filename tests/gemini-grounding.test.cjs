const assert = require('node:assert/strict');
const test = require('node:test');

const { extractWebGrounding } = require('../.tmp-tests/lib/gemini-grounding.js');

test('grounding parser accepts a text-only response without metadata', () => {
  const result = extractWebGrounding({ text: '{"title":"Ekosistem"}' });
  assert.deepEqual(result, { sources: [], queries: [], searchEntryPointHtml: undefined });
});

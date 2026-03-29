import { test } from 'node:test';
import assert from 'node:assert';
import { escapeFilterValue } from './filter-utils';

test('escapeFilterValue', async (t) => {
  await t.test('wraps simple string in double quotes', () => {
    assert.strictEqual(escapeFilterValue('search'), '"search"');
  });

  await t.test('handles string with comma', () => {
    assert.strictEqual(escapeFilterValue('search,with,comma'), '"search,with,comma"');
  });

  await t.test('escapes double quotes', () => {
    assert.strictEqual(escapeFilterValue('search "quoted" term'), '"search \\"quoted\\" term"');
  });

  await t.test('escapes backslashes', () => {
    assert.strictEqual(escapeFilterValue('search \\ with \\ backslash'), '"search \\\\ with \\\\ backslash"');
  });

  await t.test('handles complex string', () => {
    assert.strictEqual(escapeFilterValue('search "quoted" with , comma and \\ backslash'), '"search \\"quoted\\" with , comma and \\\\ backslash"');
  });
});

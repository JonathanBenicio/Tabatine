import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getSafeRedirect } from './url-utils.ts';

describe('getSafeRedirect', () => {
  test('returns a safe relative path', () => {
    assert.strictEqual(getSafeRedirect('/dashboard'), '/dashboard');
    assert.strictEqual(getSafeRedirect('/profile/settings'), '/profile/settings');
  });

  test('returns default if path does not start with /', () => {
    assert.strictEqual(getSafeRedirect('dashboard'), '/dashboard');
    assert.strictEqual(getSafeRedirect('https://evil.com'), '/dashboard');
  });

  test('prevents protocol-relative URLs (//)', () => {
    assert.strictEqual(getSafeRedirect('//evil.com'), '/dashboard');
  });

  test('prevents backslash-prefixed relative paths (/\\)', () => {
    assert.strictEqual(getSafeRedirect('/\\evil.com'), '/dashboard');
  });

  test('handles empty or null values', () => {
    assert.strictEqual(getSafeRedirect(''), '/dashboard');
    assert.strictEqual(getSafeRedirect(null), '/dashboard');
    assert.strictEqual(getSafeRedirect(undefined), '/dashboard');
  });

  test('allows custom default URL', () => {
    assert.strictEqual(getSafeRedirect('https://evil.com', '/home'), '/home');
  });

  test('rejects control characters and backslashes that URL parsers normalize', () => {
    for (const value of ['/\n/evil.com', '/\t/evil.com', '/\r/evil.com', '/path\\file', '/ path']) {
      assert.strictEqual(getSafeRedirect(value), '/dashboard');
    }
  });

  test('rejects non-string form values', () => {
    assert.strictEqual(getSafeRedirect(123), '/dashboard');
    assert.strictEqual(getSafeRedirect({}), '/dashboard');
  });

  test('preserves safe query strings and fragments', () => {
    const next = '/vendas?search=Item%20A&page=2#table';
    assert.strictEqual(getSafeRedirect(next), next);
    assert.strictEqual(new URL(getSafeRedirect(next), 'https://tabatine.example').origin, 'https://tabatine.example');
  });
});

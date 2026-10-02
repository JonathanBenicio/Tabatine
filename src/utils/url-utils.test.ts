import { test } from 'node:test';
import assert from 'node:assert';
import { getSafeRedirect } from './url-utils.ts';

test('getSafeRedirect', async (t) => {
  await t.test('returns a safe relative path', () => {
    assert.strictEqual(getSafeRedirect('/dashboard'), '/dashboard');
    assert.strictEqual(getSafeRedirect('/profile/settings'), '/profile/settings');
  });

  await t.test('returns default if path does not start with /', () => {
    assert.strictEqual(getSafeRedirect('dashboard'), '/dashboard');
    assert.strictEqual(getSafeRedirect('https://evil.com'), '/dashboard');
  });

  await t.test('prevents protocol-relative URLs (//)', () => {
    assert.strictEqual(getSafeRedirect('//evil.com'), '/dashboard');
  });

  await t.test('prevents backslash-prefixed relative paths (/\\)', () => {
    assert.strictEqual(getSafeRedirect('/\\evil.com'), '/dashboard');
  });

  await t.test('handles empty or null values', () => {
    assert.strictEqual(getSafeRedirect(''), '/dashboard');
    assert.strictEqual(getSafeRedirect(null as any), '/dashboard');
    assert.strictEqual(getSafeRedirect(undefined), '/dashboard');
  });

  await t.test('allows custom default URL', () => {
    assert.strictEqual(getSafeRedirect('https://evil.com', '/home'), '/home');
  });
});

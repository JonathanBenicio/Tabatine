import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { AvatarFileSchema, DeleteAccountSchema, MAX_AVATAR_BYTES, ProfileNameSchema, ProfilePasswordSchema, matchesImageSignature } from './profile-validation.ts';

describe('profile validation', () => {
  test('accepts a trimmed name and rejects blank or excessive names', () => {
    assert.strictEqual(ProfileNameSchema.parse({ fullName: '  Maria Silva  ' }).fullName, 'Maria Silva');
    assert.strictEqual(ProfileNameSchema.safeParse({ fullName: '   ' }).success, false);
    assert.strictEqual(ProfileNameSchema.safeParse({ fullName: 'a'.repeat(101) }).success, false);
  });
  test('requires the current eight-character password standard and matching confirmation', () => {
    assert.strictEqual(ProfilePasswordSchema.safeParse({ password: '12345678', confirmPassword: '12345678' }).success, true);
    assert.strictEqual(ProfilePasswordSchema.safeParse({ password: '123456', confirmPassword: '123456' }).success, false);
    assert.strictEqual(ProfilePasswordSchema.safeParse({ password: '12345678', confirmPassword: 'other' }).success, false);
  });
  test('requires exact deletion confirmation and ignores a client-supplied account id', () => {
    assert.strictEqual(DeleteAccountSchema.safeParse({ confirmation: 'excluir' }).success, false);
    assert.deepStrictEqual(DeleteAccountSchema.parse({ confirmation: 'EXCLUIR', userId: 'someone-else' }), { confirmation: 'EXCLUIR' });
  });
  test('rejects SVG, empty, oversized and non-file avatars', () => {
    assert.strictEqual(AvatarFileSchema.safeParse(new File(['<svg/>'], 'avatar.svg', { type: 'image/svg+xml' })).success, false);
    assert.strictEqual(AvatarFileSchema.safeParse(new File([], 'empty.png', { type: 'image/png' })).success, false);
    assert.strictEqual(AvatarFileSchema.safeParse(new File([new Uint8Array(MAX_AVATAR_BYTES + 1)], 'large.png', { type: 'image/png' })).success, false);
    assert.strictEqual(AvatarFileSchema.safeParse('avatar.png').success, false);
  });
  test('checks PNG, JPEG and WebP signatures and rejects spoofed MIME types', () => {
    assert.strictEqual(matchesImageSignature(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), 'image/png'), true);
    assert.strictEqual(matchesImageSignature(new Uint8Array([255, 216, 255]), 'image/jpeg'), true);
    assert.strictEqual(matchesImageSignature(new TextEncoder().encode('RIFF0000WEBP'), 'image/webp'), true);
    assert.strictEqual(matchesImageSignature(new TextEncoder().encode('<script>'), 'image/png'), false);
    assert.strictEqual(matchesImageSignature(new Uint8Array([137, 80]), 'image/png'), false);
  });
});

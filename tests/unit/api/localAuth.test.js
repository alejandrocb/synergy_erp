import test from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../../../src/api/localAuth.js';
import { resetDatabase, loadDatabase } from '../../../src/api/localDb.js';

test.beforeEach(() => {
  resetDatabase();
  globalThis.__SYNERGY_AUTH_MEMORY__ = new Map();
});

test('default admin user can authenticate', async () => {
  const result = await authService.login({ email: 'admin@synergy-erp.local', password: 'admin123' });
  assert.equal(result.user.email, 'admin@synergy-erp.local');
  assert.equal(result.user.role, 'admin');
  assert.ok(result.token.length > 20);
});

test('registering a new user stores a hashed password', async () => {
  await authService.register({
    full_name: 'Test User',
    email: 'user@example.com',
    password: 'securepass123',
  });

  const db = loadDatabase();
  const stored = db.users.find((user) => user.email === 'user@example.com');
  assert.ok(stored, 'user should be stored');
  assert.notEqual(stored.password_hash, 'securepass123');
  assert.equal(stored.role, 'user');
});

test('password reset flow updates the stored hash', async () => {
  await authService.register({
    full_name: 'Reset User',
    email: 'reset@example.com',
    password: 'initialPass1!',
  });

  const { token } = await authService.requestPasswordReset('reset@example.com');
  await authService.resetPassword(token, 'newSecurePass2!');

  const login = await authService.login({ email: 'reset@example.com', password: 'newSecurePass2!' });
  assert.equal(login.user.email, 'reset@example.com');
});

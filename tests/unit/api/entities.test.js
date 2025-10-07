import test from 'node:test';
import assert from 'node:assert/strict';
import { Product, User } from '../../../src/api/entities.js';
import { resetDatabase } from '../../../src/api/localDb.js';

test.beforeEach(() => {
  resetDatabase();
  globalThis.__SYNERGY_AUTH_MEMORY__ = new Map();
});

test('Product.list devuelve el catálogo inicial con campos clave', async () => {
  const products = await Product.list();
  assert.ok(Array.isArray(products));
  assert.ok(products.length > 0);
  assert.ok(products[0].code);
  assert.ok(products[0].name);
  assert.equal(typeof products[0].sale_price, 'number');
});

test('User.list no expone hashes ni metadatos sensibles', async () => {
  const users = await User.list();
  assert.ok(users.length >= 1);
  users.forEach((user) => {
    assert.ok(!('password_hash' in user), 'password hash should not be exposed');
    assert.ok(user.email);
  });
});

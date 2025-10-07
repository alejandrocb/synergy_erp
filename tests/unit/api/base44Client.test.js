import test from 'node:test';
import assert from 'node:assert/strict';
import { createBase44Client } from '../../../src/api/base44Client.js';

test('createBase44Client initialises the SDK with authentication enabled', () => {
  const calls = [];
  const fakeFactory = (config) => {
    calls.push(config);
    return { mocked: true };
  };

  const client = createBase44Client(fakeFactory);

  assert.deepEqual(calls[0], {
    appId: '68dfd15bdb69c41a0a3e58c3',
    requiresAuth: true,
  });
  assert.deepEqual(client, { mocked: true });
});

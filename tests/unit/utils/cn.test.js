import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../../../src/lib/utils.js';

test('cn merges tailwind class names without duplication', () => {
  assert.equal(cn('px-2', 'py-4', 'px-2', false && 'hidden'), 'py-4 px-2');
});

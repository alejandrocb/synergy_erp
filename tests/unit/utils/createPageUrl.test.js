import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageUrl } from '../../../src/utils/index.js';

test('createPageUrl normalises strings with spaces into kebab-case urls', () => {
  assert.equal(createPageUrl('Mi Página de Prueba'), '/mi-página-de-prueba');
});

test('createPageUrl handles consecutive spaces gracefully', () => {
  assert.equal(createPageUrl(' Reporte   mensual '), '/-reporte---mensual-');
});

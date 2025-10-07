import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerifactuHash, formatDocumentNumber, reserveDocumentNumber } from '../../../src/services/documentSeriesService.js';

function createMockEntity() {
  const calls = {
    filter: [],
    update: [],
  };

  const entity = {
    calls,
    filter: async (query) => {
      calls.filter.push(query);
      return [{ id: 'serie-1', prefix: 'FAC', last_number: 99 }];
    },
    update: async (id, payload) => {
      calls.update.push([id, payload]);
      return {};
    },
  };

  return entity;
}

test('formatDocumentNumber builds a document number with padded counter and year', () => {
  assert.equal(formatDocumentNumber('FAC', '2025-03-15', 42), 'FAC-2025-00042');
});

test('formatDocumentNumber throws when document date is invalid', () => {
  assert.throws(() => formatDocumentNumber('FAC', 'not-a-date', 1), /INVALID_DOCUMENT_DATE/);
});

test('reserveDocumentNumber requests the next number and updates the series', async () => {
  const DocumentSeries = createMockEntity();

  const result = await reserveDocumentNumber(DocumentSeries, {
    documentDate: '2025-01-10',
    documentType: 'factura_venta',
  });

  assert.equal(result.documentNumber, 'FAC-2025-00100');
  assert.equal(result.nextNumber, 100);
  assert.deepEqual(DocumentSeries.calls.filter[0], { document_type: 'factura_venta', is_active: true });
  assert.deepEqual(DocumentSeries.calls.update[0], ['serie-1', { last_number: 100 }]);
});

test('reserveDocumentNumber supports custom queries such as series id lookups', async () => {
  const DocumentSeries = createMockEntity();

  await reserveDocumentNumber(DocumentSeries, {
    documentDate: '2025-01-10',
    query: { id: 'serie-1' },
  });

  assert.deepEqual(DocumentSeries.calls.filter[0], { id: 'serie-1' });
});

test('reserveDocumentNumber throws a descriptive error when no series are active', async () => {
  const DocumentSeries = {
    filter: async () => [],
    update: async () => ({}),
  };

  await assert.rejects(
    () => reserveDocumentNumber(DocumentSeries, {
      documentDate: '2025-01-10',
      documentType: 'factura_venta',
    }),
    (error) => error.code === 'NO_ACTIVE_SERIES',
  );
});

test('createVerifactuHash builds a deterministic hash including tax id and amount', () => {
  const hash = createVerifactuHash({
    documentNumber: 'FAC-2025-00001',
    customerTaxId: 'B12345678',
    totalAmount: 150.5,
    previousHash: 'abcd',
  });

  assert.match(hash, /^[a-f0-9]{64}$/);
  const repeatedHash = createVerifactuHash({
    documentNumber: 'FAC-2025-00001',
    customerTaxId: 'B12345678',
    totalAmount: 150.5,
    previousHash: 'abcd',
  });
  assert.equal(repeatedHash, hash);
});

test('createVerifactuHash requires a document number', () => {
  assert.throws(() => createVerifactuHash({ totalAmount: 0 }), /DOCUMENT_NUMBER_REQUIRED/);
});

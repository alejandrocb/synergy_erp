import test from 'node:test';
import assert from 'node:assert/strict';
import { reserveSalesDocumentFlow } from '../../src/services/documentFlowService.js';
import { createVerifactuHash } from '../../src/services/documentSeriesService.js';

test('reserves sequential numbers for the full sales lifecycle', async () => {
  const state = {
    presupuesto_venta: { id: 'presupuesto_venta', prefix: 'PRES', last_number: 9 },
    pedido_venta: { id: 'pedido_venta', prefix: 'PED', last_number: 4 },
    albaran_venta: { id: 'albaran_venta', prefix: 'ALB', last_number: 14 },
    factura_venta: { id: 'factura_venta', prefix: 'FAC', last_number: 29 },
  };

  const DocumentSeries = {
    filter: async (query) => {
      const key = query.document_type ?? query.id;
      const match = key ? state[key] : null;
      return match ? [{ ...match }] : [];
    },
    update: async (id, payload) => {
      if (state[id]) {
        state[id] = { ...state[id], ...payload };
      }
      return { id, ...payload };
    },
  };

  const reservations = await reserveSalesDocumentFlow(DocumentSeries, '2025-04-12');

  assert.deepEqual(
    reservations.map((step) => step.documentNumber),
    ['PRES-2025-00010', 'PED-2025-00005', 'ALB-2025-00015', 'FAC-2025-00030'],
  );

  assert.equal(new Set(reservations.map((step) => step.documentNumber)).size, 4);
  assert.equal(state.factura_venta.last_number, 30);

  let previousHash = '';
  for (const step of reservations) {
    previousHash = createVerifactuHash({
      documentNumber: step.documentNumber,
      customerTaxId: 'B99887766',
      totalAmount: 120.45,
      previousHash,
    });
    assert.match(previousHash, /^[a-f0-9]{64}$/);
  }
});

test('propagates when a step lacks a configured series', async () => {
  const state = {
    presupuesto_venta: { id: 'presupuesto_venta', prefix: 'PRES', last_number: 9 },
    pedido_venta: { id: 'pedido_venta', prefix: 'PED', last_number: 4 },
    factura_venta: { id: 'factura_venta', prefix: 'FAC', last_number: 29 },
  };

  const DocumentSeries = {
    filter: async (query) => {
      const key = query.document_type ?? query.id;
      const match = key ? state[key] : null;
      return match ? [{ ...match }] : [];
    },
    update: async () => ({}),
  };

  await assert.rejects(
    () => reserveSalesDocumentFlow(DocumentSeries, '2025-04-12'),
    (error) => error.code === 'NO_ACTIVE_SERIES',
  );
});

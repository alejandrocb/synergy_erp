import { reserveDocumentNumber } from './documentSeriesService.js';

export const SALES_FLOW_STEPS = [
  { key: 'presupuesto', documentType: 'presupuesto_venta' },
  { key: 'pedido', documentType: 'pedido_venta' },
  { key: 'albaran', documentType: 'albaran_venta' },
  { key: 'factura', documentType: 'factura_venta' },
];

export async function reserveSalesDocumentFlow(DocumentSeriesEntity, documentDate, options = {}) {
  const { steps = SALES_FLOW_STEPS, padSize } = options;

  const reservations = [];
  for (const step of steps) {
    const reservation = await reserveDocumentNumber(DocumentSeriesEntity, {
      documentDate,
      documentType: step.documentType,
      query: step.query,
      padSize,
    });

    reservations.push({
      ...step,
      ...reservation,
    });
  }

  return reservations;
}

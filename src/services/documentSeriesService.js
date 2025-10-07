export const DEFAULT_SERIES_PAD = 5;

export function formatDocumentNumber(prefix, documentDate, nextNumber, padSize = DEFAULT_SERIES_PAD) {
  if (!prefix) {
    throw new Error('DOCUMENT_PREFIX_REQUIRED');
  }

  const parsedDate = new Date(documentDate);
  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('INVALID_DOCUMENT_DATE');
    error.code = 'INVALID_DOCUMENT_DATE';
    error.meta = { documentDate };
    throw error;
  }

  const year = parsedDate.getFullYear();
  const padded = String(nextNumber).padStart(padSize, '0');
  return `${prefix}-${year}-${padded}`;
}

export async function reserveDocumentNumber(DocumentSeriesEntity, {
  documentDate,
  documentType,
  query,
  padSize = DEFAULT_SERIES_PAD,
} = {}) {
  if (!DocumentSeriesEntity || typeof DocumentSeriesEntity.filter !== 'function' || typeof DocumentSeriesEntity.update !== 'function') {
    throw new Error('INVALID_DOCUMENT_SERIES_ENTITY');
  }

  if (!documentDate) {
    const error = new Error('DOCUMENT_DATE_REQUIRED');
    error.code = 'DOCUMENT_DATE_REQUIRED';
    throw error;
  }

  const appliedQuery = query ?? (documentType ? { document_type: documentType, is_active: true } : null);

  if (!appliedQuery) {
    const error = new Error('SERIES_QUERY_REQUIRED');
    error.code = 'SERIES_QUERY_REQUIRED';
    throw error;
  }

  const series = await DocumentSeriesEntity.filter(appliedQuery);

  if (!Array.isArray(series) || series.length === 0) {
    const error = new Error('NO_ACTIVE_SERIES');
    error.code = 'NO_ACTIVE_SERIES';
    error.meta = { documentType, query: appliedQuery };
    throw error;
  }

  const activeSeries = series[0];
  const lastNumber = Number(activeSeries.last_number ?? 0);
  const nextNumber = lastNumber + 1;
  const documentNumber = formatDocumentNumber(activeSeries.prefix, documentDate, nextNumber, padSize);

  await DocumentSeriesEntity.update(activeSeries.id, { last_number: nextNumber });

  return {
    documentNumber,
    nextNumber,
    series: activeSeries,
  };
}

export function createVerifactuHash({
  documentNumber,
  customerTaxId,
  totalAmount,
  previousHash = '',
} = {}) {
  if (!documentNumber) {
    const error = new Error('DOCUMENT_NUMBER_REQUIRED');
    error.code = 'DOCUMENT_NUMBER_REQUIRED';
    throw error;
  }

  const normalizedTaxId = customerTaxId?.trim() || 'ANON';
  const normalizedAmount = Number(totalAmount ?? 0).toFixed(2);
  const payload = `${documentNumber}|${normalizedTaxId}|${normalizedAmount}|${previousHash}`;

  const segments = [];
  let seed = 0x811c9dc5;
  const prime = 16777619;

  for (let i = 0; i < 8; i += 1) {
    let hash = seed ^ i;
    for (let index = 0; index < payload.length; index += 1) {
      hash ^= payload.charCodeAt(index) + i;
      hash = Math.imul(hash, prime);
      hash >>>= 0;
    }
    segments.push(hash.toString(16).padStart(8, '0'));
    seed = (hash ^ (seed >>> 1)) >>> 0;
  }

  return segments.join('');
}

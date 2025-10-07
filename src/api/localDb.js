const STORAGE_KEY = 'synergy_erp_local_db_v1';
const MEMORY_KEY = Symbol.for('synergy_erp_local_db');

const getNow = () => new Date().toISOString();

const defaultPasswordHash = 'pbkdf2$sha256$310000$r0k2TsGSXtKsoRYEf76aGQ$41sy3mIkmV9WTDXRUmaZKq_RM96Z1Cy_ua9AG_-z1rs';

const generateId = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Math.random().toString(16).slice(2)}-${Date.now()}`;
};

const DEFAULT_DB = {
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      email: 'admin@synergy-erp.local',
      full_name: 'Administrador General',
      role: 'admin',
      password_hash: defaultPasswordHash,
      created_date: getNow(),
      last_login_at: null,
    },
  ],
  companySettings: [
    {
      id: 'setting-company-name',
      setting_key: 'company_name',
      setting_value: 'Synergy ERP',
      description: 'Nombre visible en la cabecera de la aplicación',
    },
    {
      id: 'setting-module_productos',
      setting_key: 'module_productos',
      setting_value: 'true',
      description: 'Módulo de catálogo de productos',
    },
    {
      id: 'setting-module_clientes',
      setting_key: 'module_clientes',
      setting_value: 'true',
      description: 'Módulo de gestión de clientes',
    },
    {
      id: 'setting-module_proveedores',
      setting_key: 'module_proveedores',
      setting_value: 'true',
      description: 'Módulo de gestión de proveedores',
    },
    {
      id: 'setting-module_almacenes',
      setting_key: 'module_almacenes',
      setting_value: 'true',
      description: 'Módulo de almacenes',
    },
    {
      id: 'setting-module_ventas',
      setting_key: 'module_ventas',
      setting_value: 'true',
      description: 'Módulo de ventas',
    },
    {
      id: 'setting-module_compras',
      setting_key: 'module_compras',
      setting_value: 'true',
      description: 'Módulo de compras',
    },
    {
      id: 'setting-module_movimientos',
      setting_key: 'module_movimientos',
      setting_value: 'true',
      description: 'Módulo de movimientos de stock',
    },
    {
      id: 'setting-module_traspasos',
      setting_key: 'module_traspasos',
      setting_value: 'true',
      description: 'Módulo de traspasos de almacén',
    },
    {
      id: 'setting-module_trazabilidad',
      setting_key: 'module_trazabilidad',
      setting_value: 'true',
      description: 'Módulo de trazabilidad',
    },
  ],
  products: [
    {
      id: 'prod-1',
      code: 'PROD-001',
      barcode: '8437000000010',
      name: 'Portátil Pro 14"',
      description: 'Ordenador portátil profesional con 16GB RAM y 512GB SSD',
      category: 'Informática',
      unit_of_measure: 'unidad',
      purchase_price: 950,
      sale_price: 1299,
      sale_tax_rate_id: 'tax-iva21',
      purchase_tax_rate_id: 'tax-iva21',
      traceability_type: 'lot',
      min_stock: 5,
      current_stock: 12,
      manages_stock: true,
      is_active: true,
    },
    {
      id: 'prod-2',
      code: 'PROD-002',
      barcode: '8437000000027',
      name: 'Silla Ergonómica ErgoX',
      description: 'Silla de oficina con soporte lumbar y reposacabezas',
      category: 'Mobiliario',
      unit_of_measure: 'unidad',
      purchase_price: 140,
      sale_price: 245,
      sale_tax_rate_id: 'tax-iva21',
      purchase_tax_rate_id: 'tax-iva21',
      traceability_type: 'none',
      min_stock: 10,
      current_stock: 25,
      manages_stock: true,
      is_active: true,
    },
  ],
  warehouses: [
    {
      id: 'wh-1',
      code: 'MAD-01',
      name: 'Almacén Central Madrid',
      address: 'Calle Mayor 123',
      city: 'Madrid',
      country: 'España',
      is_active: true,
    },
    {
      id: 'wh-2',
      code: 'BCN-01',
      name: 'Almacén Barcelona',
      address: 'Avinguda Diagonal 456',
      city: 'Barcelona',
      country: 'España',
      is_active: true,
    },
  ],
  customers: [
    {
      id: 'cust-1',
      code: 'CUST-001',
      business_name: 'Tecnologías Avanzadas SL',
      tax_id: 'B12345678',
      contact_person: 'Laura Gómez',
      email: 'compras@tecnologiasavanzadas.es',
      phone: '+34 912 345 678',
      address: 'Calle Innovación 42',
      city: 'Madrid',
      postal_code: '28001',
      country: 'España',
      payment_terms: '30 días',
      is_active: true,
    },
  ],
  suppliers: [
    {
      id: 'sup-1',
      code: 'SUP-001',
      business_name: 'Distribuciones Globales SA',
      tax_id: 'A98765432',
      contact_person: 'Carlos Pérez',
      email: 'ventas@distribucionesglobales.com',
      phone: '+34 934 567 890',
      address: 'Calle Comercio 78',
      city: 'Barcelona',
      postal_code: '08015',
      country: 'España',
      payment_terms: '45 días',
      is_active: true,
    },
  ],
  taxRates: [
    {
      id: 'tax-iva21',
      code: 'IVA21',
      name: 'IVA General 21%',
      rate: 21,
      type: 'both',
      is_default: true,
      is_active: true,
      description: 'Impuesto general para operaciones nacionales',
    },
    {
      id: 'tax-iva10',
      code: 'IVA10',
      name: 'IVA Reducido 10%',
      rate: 10,
      type: 'sale',
      is_default: false,
      is_active: true,
      description: 'Impuesto reducido para alimentación',
    },
  ],
  documentSeries: [
    {
      id: 'series-factura-venta',
      prefix: 'FV',
      document_type: 'factura_venta',
      last_number: 125,
      is_active: true,
      description: 'Serie principal facturas de venta',
    },
    {
      id: 'series-pedido-compra',
      prefix: 'PC',
      document_type: 'pedido_compra',
      last_number: 87,
      is_active: true,
      description: 'Serie pedidos de compra',
    },
  ],
  saleDocuments: [
    {
      id: 'sale-1',
      document_number: 'FV-2025-0126',
      document_date: '2025-01-08',
      customer_id: 'cust-1',
      total_amount: 2598,
      status: 'issued',
      warehouse_id: 'wh-1',
      due_date: '2025-02-07',
    },
  ],
  saleLines: [
    {
      id: 'sale-line-1',
      sale_document_id: 'sale-1',
      product_id: 'prod-1',
      quantity: 2,
      unit_price: 1299,
      tax_rate_id: 'tax-iva21',
      total_amount: 2598,
    },
  ],
  purchaseDocuments: [
    {
      id: 'purchase-1',
      document_number: 'PC-2025-0088',
      document_date: '2025-01-05',
      supplier_id: 'sup-1',
      total_amount: 1800,
      status: 'received',
      warehouse_id: 'wh-1',
      due_date: '2025-02-04',
    },
  ],
  purchaseLines: [
    {
      id: 'purchase-line-1',
      purchase_document_id: 'purchase-1',
      product_id: 'prod-2',
      quantity: 10,
      unit_price: 140,
      tax_rate_id: 'tax-iva21',
      total_amount: 1400,
    },
  ],
  stockMovements: [
    {
      id: 'sm-1',
      product_id: 'prod-1',
      warehouse_id: 'wh-1',
      movement_type: 'out',
      quantity: 2,
      movement_date: '2025-01-08',
      reference: 'FV-2025-0126',
      notes: 'Venta a Tecnologías Avanzadas SL',
    },
    {
      id: 'sm-2',
      product_id: 'prod-2',
      warehouse_id: 'wh-1',
      movement_type: 'in',
      quantity: 10,
      movement_date: '2025-01-05',
      reference: 'PC-2025-0088',
      notes: 'Recepción proveedor Distribuciones Globales',
    },
  ],
  warehouseTransfers: [
    {
      id: 'transfer-1',
      transfer_number: 'TR-2025-0004',
      origin_warehouse_id: 'wh-1',
      destination_warehouse_id: 'wh-2',
      transfer_date: '2025-01-03',
      status: 'completed',
    },
  ],
  transferLines: [
    {
      id: 'transfer-line-1',
      warehouse_transfer_id: 'transfer-1',
      product_id: 'prod-2',
      quantity: 5,
    },
  ],
  pointsOfSale: [
    {
      id: 'pos-1',
      code: 'POS-001',
      name: 'Mostrador Madrid',
      warehouse_id: 'wh-1',
      is_active: true,
    },
  ],
  productStock: [
    {
      id: 'stock-1',
      product_id: 'prod-1',
      warehouse_id: 'wh-1',
      product_code: 'PROD-001',
      product_name: 'Portátil Pro 14"',
      warehouse_name: 'Almacén Central Madrid',
      current_stock: 12,
      reserved_stock: 2,
      available_stock: 10,
    },
    {
      id: 'stock-2',
      product_id: 'prod-2',
      warehouse_id: 'wh-1',
      product_code: 'PROD-002',
      product_name: 'Silla Ergonómica ErgoX',
      warehouse_name: 'Almacén Central Madrid',
      current_stock: 25,
      reserved_stock: 0,
      available_stock: 25,
    },
  ],
};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  if (!globalThis[MEMORY_KEY]) {
    globalThis[MEMORY_KEY] = new Map();
  }

  const store = globalThis[MEMORY_KEY];

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function clone(value) {
  if (value == null) {
    return value;
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function loadDatabase() {
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return clone(DEFAULT_DB);
  }

  try {
    return clone(JSON.parse(raw));
  } catch (error) {
    console.error('Failed to parse persisted database, restoring defaults', error);
    storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return clone(DEFAULT_DB);
  }
}

export function persistDatabase(db) {
  const storage = getStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDatabase() {
  persistDatabase(DEFAULT_DB);
}

export function createEntityAdapter(entityName, { sanitize } = {}) {
  const normalizer = typeof sanitize === 'function' ? sanitize : (record) => record;

  const getCollection = () => {
    const db = loadDatabase();
    if (!db[entityName]) {
      db[entityName] = [];
      persistDatabase(db);
    }
    return db[entityName];
  };

  const saveCollection = (collection) => {
    const db = loadDatabase();
    db[entityName] = collection;
    persistDatabase(db);
  };

  const sortCollection = (records, orderBy) => {
    if (!orderBy) {
      return records;
    }

    const direction = orderBy.startsWith('-') ? -1 : 1;
    const field = orderBy.replace(/^[-+]/, '');

    return [...records].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (aValue === bValue) {
        return 0;
      }
      if (aValue == null) {
        return 1 * direction;
      }
      if (bValue == null) {
        return -1 * direction;
      }
      return aValue > bValue ? direction : -direction;
    });
  };

  const applyQuery = (records, query) => {
    if (!query || typeof query !== 'object') {
      return records;
    }

    return records.filter((record) => {
      return Object.entries(query).every(([key, expected]) => {
        if (expected === undefined) {
          return true;
        }
        const value = record[key];
        if (typeof expected === 'boolean') {
          return Boolean(value) === expected;
        }
        if (Array.isArray(expected)) {
          return expected.includes(value);
        }
        if (expected === null) {
          return value === null;
        }
        return value === expected;
      });
    });
  };

  const sanitizeRecord = (record) => clone(normalizer(record));

  return {
    async list(orderBy, limit) {
      const collection = getCollection();
      const sorted = sortCollection(collection, orderBy);
      const sliced = typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
      return sliced.map(sanitizeRecord);
    },

    async filter(query, { orderBy, limit } = {}) {
      const collection = getCollection();
      const filtered = applyQuery(collection, query);
      const sorted = sortCollection(filtered, orderBy);
      const sliced = typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
      return sliced.map(sanitizeRecord);
    },

    async findById(id) {
      const collection = getCollection();
      const record = collection.find((item) => item.id === id);
      return record ? sanitizeRecord(record) : null;
    },

    async create(payload) {
      const collection = getCollection();
      const id = generateId();
      const record = {
        ...payload,
        id,
        created_date: payload?.created_date ?? getNow(),
      };
      collection.push(record);
      saveCollection(collection);
      return sanitizeRecord(record);
    },

    async update(id, updates) {
      const collection = getCollection();
      const index = collection.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Record with id ${id} not found in ${entityName}`);
      }
      const updated = {
        ...collection[index],
        ...updates,
        updated_date: getNow(),
      };
      collection[index] = updated;
      saveCollection(collection);
      return sanitizeRecord(updated);
    },

    async delete(id) {
      const collection = getCollection();
      const filtered = collection.filter((item) => item.id !== id);
      saveCollection(filtered);
      return { success: true };
    },
  };
}

export function getDefaultDatabase() {
  return clone(DEFAULT_DB);
}

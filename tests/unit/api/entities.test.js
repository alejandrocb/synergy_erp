import test from 'node:test';
import assert from 'node:assert/strict';
import { extractEntityBindings } from '../../../src/api/entities.js';

test('extractEntityBindings re-exports SDK entities and auth helpers', () => {
  const stubEntities = {
    Product: { name: 'Product' },
    Warehouse: { name: 'Warehouse' },
    Customer: { name: 'Customer' },
    Supplier: { name: 'Supplier' },
    CompanySettings: { name: 'CompanySettings' },
    SaleDocument: { name: 'SaleDocument' },
    SaleLine: { name: 'SaleLine' },
    PurchaseDocument: { name: 'PurchaseDocument' },
    PurchaseLine: { name: 'PurchaseLine' },
    StockMovement: { name: 'StockMovement' },
    WarehouseTransfer: { name: 'WarehouseTransfer' },
    TransferLine: { name: 'TransferLine' },
    DocumentSeries: { name: 'DocumentSeries' },
    PointOfSale: { name: 'PointOfSale' },
    TaxRate: { name: 'TaxRate' },
    ProductStock: { name: 'ProductStock' },
  };

  const stubAuth = { me: () => {} };

  const bindings = extractEntityBindings({
    entities: stubEntities,
    auth: stubAuth,
  });

  Object.entries(stubEntities).forEach(([key, value]) => {
    assert.equal(bindings[key], value);
  });
  assert.equal(bindings.User, stubAuth);
});

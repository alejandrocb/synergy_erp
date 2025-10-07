import { base44 } from './base44Client.js';

export function extractEntityBindings(client = base44) {
  return {
    Product: client.entities.Product,
    Warehouse: client.entities.Warehouse,
    Customer: client.entities.Customer,
    Supplier: client.entities.Supplier,
    CompanySettings: client.entities.CompanySettings,
    SaleDocument: client.entities.SaleDocument,
    SaleLine: client.entities.SaleLine,
    PurchaseDocument: client.entities.PurchaseDocument,
    PurchaseLine: client.entities.PurchaseLine,
    StockMovement: client.entities.StockMovement,
    WarehouseTransfer: client.entities.WarehouseTransfer,
    TransferLine: client.entities.TransferLine,
    DocumentSeries: client.entities.DocumentSeries,
    PointOfSale: client.entities.PointOfSale,
    TaxRate: client.entities.TaxRate,
    ProductStock: client.entities.ProductStock,
    User: client.auth,
  };
}

const bindings = extractEntityBindings();

export const Product = bindings.Product;
export const Warehouse = bindings.Warehouse;
export const Customer = bindings.Customer;
export const Supplier = bindings.Supplier;
export const CompanySettings = bindings.CompanySettings;
export const SaleDocument = bindings.SaleDocument;
export const SaleLine = bindings.SaleLine;
export const PurchaseDocument = bindings.PurchaseDocument;
export const PurchaseLine = bindings.PurchaseLine;
export const StockMovement = bindings.StockMovement;
export const WarehouseTransfer = bindings.WarehouseTransfer;
export const TransferLine = bindings.TransferLine;
export const DocumentSeries = bindings.DocumentSeries;
export const PointOfSale = bindings.PointOfSale;
export const TaxRate = bindings.TaxRate;
export const ProductStock = bindings.ProductStock;
export const User = bindings.User;

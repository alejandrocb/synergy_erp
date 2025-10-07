import { createEntityAdapter } from './localDb.js';
import { authService } from './localAuth.js';

const Product = createEntityAdapter('products');
const Warehouse = createEntityAdapter('warehouses');
const Customer = createEntityAdapter('customers');
const Supplier = createEntityAdapter('suppliers');
const CompanySettings = createEntityAdapter('companySettings');
const SaleDocument = createEntityAdapter('saleDocuments');
const SaleLine = createEntityAdapter('saleLines');
const PurchaseDocument = createEntityAdapter('purchaseDocuments');
const PurchaseLine = createEntityAdapter('purchaseLines');
const StockMovement = createEntityAdapter('stockMovements');
const WarehouseTransfer = createEntityAdapter('warehouseTransfers');
const TransferLine = createEntityAdapter('transferLines');
const DocumentSeries = createEntityAdapter('documentSeries');
const PointOfSale = createEntityAdapter('pointsOfSale');
const TaxRate = createEntityAdapter('taxRates');
const ProductStock = createEntityAdapter('productStock');

const UserEntity = createEntityAdapter('users', {
  sanitize(user) {
    if (!user) {
      return user;
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },
});

export const User = {
  ...UserEntity,
  async list() {
    return authService.listUsers();
  },
  async create(payload) {
    return authService.register(payload);
  },
  async update(id, updates) {
    return authService.updateUser(id, updates);
  },
  async delete(id) {
    return authService.deleteUser(id);
  },
  async login(credentials) {
    return authService.login(credentials);
  },
  async logout() {
    return authService.logout();
  },
  async me() {
    return authService.getCurrentUser();
  },
  async register(payload) {
    return authService.register(payload);
  },
  async requestPasswordReset(email) {
    return authService.requestPasswordReset(email);
  },
  async resetPassword(token, newPassword) {
    return authService.resetPassword(token, newPassword);
  },
};

export {
  Product,
  Warehouse,
  Customer,
  Supplier,
  CompanySettings,
  SaleDocument,
  SaleLine,
  PurchaseDocument,
  PurchaseLine,
  StockMovement,
  WarehouseTransfer,
  TransferLine,
  DocumentSeries,
  PointOfSale,
  TaxRate,
  ProductStock,
};

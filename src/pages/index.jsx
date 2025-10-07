import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './Layout.jsx';
import Transfers from './Transfers.jsx';
import Admin from './Admin.jsx';
import Dashboard from './Dashboard.jsx';
import Sales from './Sales.jsx';
import Purchases from './Purchases.jsx';
import StockMovements from './StockMovements.jsx';
import Products from './Products.jsx';
import Customers from './Customers.jsx';
import Suppliers from './Suppliers.jsx';
import Warehouses from './Warehouses.jsx';
import DocumentSeries from './DocumentSeries.jsx';
import SalesQuotes from './SalesQuotes.jsx';
import SalesOrders from './SalesOrders.jsx';
import SalesDeliveries from './SalesDeliveries.jsx';
import SalesInvoices from './SalesInvoices.jsx';
import PurchaseQuotes from './PurchaseQuotes.jsx';
import PurchaseOrders from './PurchaseOrders.jsx';
import PurchaseDeliveries from './PurchaseDeliveries.jsx';
import PurchaseInvoices from './PurchaseInvoices.jsx';
import PointsOfSale from './PointsOfSale.jsx';
import SalesSimplified from './SalesSimplified.jsx';
import TPV from './TPV.jsx';
import TaxRates from './TaxRates.jsx';
import ProductStock from './ProductStock.jsx';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import ForgotPassword from './auth/ForgotPassword.jsx';
import ResetPassword from './auth/ResetPassword.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

const PAGES = {
  Transfers,
  Admin,
  Dashboard,
  Sales,
  Purchases,
  StockMovements,
  Products,
  Customers,
  Suppliers,
  Warehouses,
  DocumentSeries,
  SalesQuotes,
  SalesOrders,
  SalesDeliveries,
  SalesInvoices,
  PurchaseQuotes,
  PurchaseOrders,
  PurchaseDeliveries,
  PurchaseInvoices,
  PointsOfSale,
  SalesSimplified,
  TPV,
  TaxRates,
  ProductStock,
};

function getCurrentPageName(pathname) {
  let url = pathname || '/';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split('/').pop();
  if (urlLastPart?.includes('?')) {
    urlLastPart = urlLastPart.split('?')[0];
  }

  const pageName = Object.keys(PAGES).find((page) => page.toLowerCase() === urlLastPart?.toLowerCase());
  return pageName || 'Transfers';
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function LayoutContainer() {
  const location = useLocation();
  const currentPage = getCurrentPageName(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Outlet />
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutContainer />}>
            <Route index element={<Transfers />} />
            <Route path="Transfers" element={<Transfers />} />
            <Route path="Admin" element={<Admin />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Sales" element={<Sales />} />
            <Route path="Purchases" element={<Purchases />} />
            <Route path="StockMovements" element={<StockMovements />} />
            <Route path="Products" element={<Products />} />
            <Route path="Customers" element={<Customers />} />
            <Route path="Suppliers" element={<Suppliers />} />
            <Route path="Warehouses" element={<Warehouses />} />
            <Route path="DocumentSeries" element={<DocumentSeries />} />
            <Route path="SalesQuotes" element={<SalesQuotes />} />
            <Route path="SalesOrders" element={<SalesOrders />} />
            <Route path="SalesDeliveries" element={<SalesDeliveries />} />
            <Route path="SalesInvoices" element={<SalesInvoices />} />
            <Route path="PurchaseQuotes" element={<PurchaseQuotes />} />
            <Route path="PurchaseOrders" element={<PurchaseOrders />} />
            <Route path="PurchaseDeliveries" element={<PurchaseDeliveries />} />
            <Route path="PurchaseInvoices" element={<PurchaseInvoices />} />
            <Route path="PointsOfSale" element={<PointsOfSale />} />
            <Route path="SalesSimplified" element={<SalesSimplified />} />
            <Route path="TPV" element={<TPV />} />
            <Route path="TaxRates" element={<TaxRates />} />
            <Route path="ProductStock" element={<ProductStock />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

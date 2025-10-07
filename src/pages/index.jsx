import Layout from "./Layout.jsx";

import Transfers from "./Transfers";

import Admin from "./Admin";

import Dashboard from "./Dashboard";

import Sales from "./Sales";

import Purchases from "./Purchases";

import StockMovements from "./StockMovements";

import Products from "./Products";

import Customers from "./Customers";

import Suppliers from "./Suppliers";

import Warehouses from "./Warehouses";

import DocumentSeries from "./DocumentSeries";

import SalesQuotes from "./SalesQuotes";

import SalesOrders from "./SalesOrders";

import SalesDeliveries from "./SalesDeliveries";

import SalesInvoices from "./SalesInvoices";

import PurchaseQuotes from "./PurchaseQuotes";

import PurchaseOrders from "./PurchaseOrders";

import PurchaseDeliveries from "./PurchaseDeliveries";

import PurchaseInvoices from "./PurchaseInvoices";

import PointsOfSale from "./PointsOfSale";

import SalesSimplified from "./SalesSimplified";

import TPV from "./TPV";

import TaxRates from "./TaxRates";

import ProductStock from "./ProductStock";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Transfers: Transfers,
    
    Admin: Admin,
    
    Dashboard: Dashboard,
    
    Sales: Sales,
    
    Purchases: Purchases,
    
    StockMovements: StockMovements,
    
    Products: Products,
    
    Customers: Customers,
    
    Suppliers: Suppliers,
    
    Warehouses: Warehouses,
    
    DocumentSeries: DocumentSeries,
    
    SalesQuotes: SalesQuotes,
    
    SalesOrders: SalesOrders,
    
    SalesDeliveries: SalesDeliveries,
    
    SalesInvoices: SalesInvoices,
    
    PurchaseQuotes: PurchaseQuotes,
    
    PurchaseOrders: PurchaseOrders,
    
    PurchaseDeliveries: PurchaseDeliveries,
    
    PurchaseInvoices: PurchaseInvoices,
    
    PointsOfSale: PointsOfSale,
    
    SalesSimplified: SalesSimplified,
    
    TPV: TPV,
    
    TaxRates: TaxRates,
    
    ProductStock: ProductStock,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Transfers />} />
                
                
                <Route path="/Transfers" element={<Transfers />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Sales" element={<Sales />} />
                
                <Route path="/Purchases" element={<Purchases />} />
                
                <Route path="/StockMovements" element={<StockMovements />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Customers" element={<Customers />} />
                
                <Route path="/Suppliers" element={<Suppliers />} />
                
                <Route path="/Warehouses" element={<Warehouses />} />
                
                <Route path="/DocumentSeries" element={<DocumentSeries />} />
                
                <Route path="/SalesQuotes" element={<SalesQuotes />} />
                
                <Route path="/SalesOrders" element={<SalesOrders />} />
                
                <Route path="/SalesDeliveries" element={<SalesDeliveries />} />
                
                <Route path="/SalesInvoices" element={<SalesInvoices />} />
                
                <Route path="/PurchaseQuotes" element={<PurchaseQuotes />} />
                
                <Route path="/PurchaseOrders" element={<PurchaseOrders />} />
                
                <Route path="/PurchaseDeliveries" element={<PurchaseDeliveries />} />
                
                <Route path="/PurchaseInvoices" element={<PurchaseInvoices />} />
                
                <Route path="/PointsOfSale" element={<PointsOfSale />} />
                
                <Route path="/SalesSimplified" element={<SalesSimplified />} />
                
                <Route path="/TPV" element={<TPV />} />
                
                <Route path="/TaxRates" element={<TaxRates />} />
                
                <Route path="/ProductStock" element={<ProductStock />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
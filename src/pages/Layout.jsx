

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { CompanySettings } from "@/api/entities";
import {
  Package,
  Users,
  Building2,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  ArrowLeftRight,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Shield,
  Percent // Added Percent icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [enabledModules, setEnabledModules] = useState({
    productos: true,
    clientes: true,
    proveedores: true,
    almacenes: true,
    ventas: true,
    compras: true,
    movimientos: true,
    traspasos: true,
    trazabilidad: true
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const settings = await CompanySettings.list();
      const modulesConfig = {};
      settings.forEach(setting => {
        if (setting.setting_key.startsWith('module_')) {
          const moduleName = setting.setting_key.replace('module_', '');
          modulesConfig[moduleName] = setting.setting_value === 'true';
        }
      });
      
      if (Object.keys(modulesConfig).length > 0) {
        setEnabledModules(prev => ({ ...prev, ...modulesConfig }));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleLogout = async () => {
    await User.logout();
  };

  const menuSections = [
    {
      label: "Maestros",
      items: [
        { title: "Productos", url: "Products", icon: Package, module: "productos" },
        { title: "Clientes", url: "Customers", icon: Users, module: "clientes" },
        { title: "Proveedores", url: "Suppliers", icon: Building2, module: "proveedores" },
        { title: "Almacenes", url: "Warehouses", icon: Warehouse, module: "almacenes" },
      ].filter(item => enabledModules[item.module])
    },
    {
      label: "Ventas",
      show: enabledModules.ventas,
      items: [
        { title: "TPV", url: "TPV", icon: ShoppingCart },
        { title: "Presupuestos", url: "SalesQuotes", icon: ShoppingCart },
        { title: "Pedidos", url: "SalesOrders", icon: ShoppingCart },
        { title: "Albaranes", url: "SalesDeliveries", icon: ShoppingCart },
        { title: "Facturas", url: "SalesInvoices", icon: ShoppingCart },
        { title: "Facturas Simplificadas", url: "SalesSimplified", icon: ShoppingCart },
      ]
    },
    {
      label: "Compras",
      show: enabledModules.compras,
      items: [
        { title: "Presupuestos", url: "PurchaseQuotes", icon: ShoppingBag },
        { title: "Pedidos", url: "PurchaseOrders", icon: ShoppingBag },
        { title: "Albaranes", url: "PurchaseDeliveries", icon: ShoppingBag },
        { title: "Facturas", url: "PurchaseInvoices", icon: ShoppingBag },
      ]
    },
    {
      label: "Almacén",
      show: enabledModules.movimientos || enabledModules.traspasos,
      items: [
        enabledModules.movimientos && { title: "Movimientos", url: "StockMovements", icon: TrendingUp },
        enabledModules.traspasos && { title: "Traspasos", url: "Transfers", icon: ArrowLeftRight },
      ].filter(Boolean)
    },
    {
      label: "Configuración",
      show: true,
      items: [
        { title: "Puntos de Venta", url: "PointsOfSale", icon: Settings },
        { title: "Series de Documentos", url: "DocumentSeries", icon: Settings },
        { title: "Tipos de Impuesto", url: "TaxRates", icon: Percent }, // Added "Tipos de Impuesto"
      ]
    }
  ].filter(section => section.show !== false && section.items.length > 0);

  const NavDropdown = ({ section }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50">
          {section.label}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {section.items.map((item) => (
          <DropdownMenuItem key={item.url} asChild>
            <Link 
              to={createPageUrl(item.url)} 
              className="flex items-center gap-3 cursor-pointer"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 text-xl">ERP Pro</h1>
                <p className="text-xs text-gray-500">Gestión Empresarial</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to={createPageUrl("Dashboard")}>
                <Button 
                  variant="ghost" 
                  className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 ${
                    location.pathname === createPageUrl("Dashboard") ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
              
              {menuSections.map((section) => (
                <NavDropdown key={section.label} section={section} />
              ))}

              {currentUser?.role === 'admin' && (
                <Link to={createPageUrl("Admin")}>
                  <Button 
                    variant="ghost" 
                    className={`flex items-center gap-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 ${
                      location.pathname === createPageUrl("Admin") ? "bg-indigo-50 text-indigo-600" : ""
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Administración
                  </Button>
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {currentUser?.full_name?.[0] || currentUser?.email?.[0] || "U"}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.full_name || currentUser?.email || "Usuario"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser?.role || "user"}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{currentUser?.full_name || "Usuario"}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link 
                      to={createPageUrl("Dashboard")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    
                    {menuSections.map((section) => (
                      <div key={section.label} className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase px-3">
                          {section.label}
                        </p>
                        {section.items.map((item) => (
                          <Link
                            key={item.url}
                            to={createPageUrl(item.url)}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    ))}

                    {currentUser?.role === 'admin' && (
                      <Link
                        to={createPageUrl("Admin")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-indigo-600"
                      >
                        <Shield className="w-4 h-4" />
                        Administración
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}


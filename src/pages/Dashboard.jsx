import React, { useState, useEffect } from "react";
import { SaleDocument } from "@/api/entities";
import { PurchaseDocument } from "@/api/entities";
import { StockMovement } from "@/api/entities";
import { Product } from "@/api/entities";
import { Customer } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ShoppingCart,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStock: 0,
    recentSales: 0,
    recentPurchases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sales, purchases, customers, products] = await Promise.all([
        SaleDocument.list('-created_date', 100),
        PurchaseDocument.list('-created_date', 100),
        Customer.list(),
        Product.list()
      ]);

      const lowStockProducts = products.filter(p => {
        return p.min_stock && p.current_stock < p.min_stock;
      });

      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      
      const recentSales = sales.filter(s => new Date(s.document_date) > thirtyDaysAgo);
      const recentPurchases = purchases.filter(p => new Date(p.document_date) > thirtyDaysAgo);

      const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalPurchasesAmount = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);

      setStats({
        totalSales: totalSalesAmount,
        totalPurchases: totalPurchasesAmount,
        totalCustomers: customers.length,
        totalProducts: products.length,
        lowStock: lowStockProducts.length,
        recentSales: recentSales.length,
        recentPurchases: recentPurchases.length
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const salesByMonth = [
    { month: 'Ene', ventas: 45000, compras: 32000 },
    { month: 'Feb', ventas: 52000, compras: 38000 },
    { month: 'Mar', ventas: 48000, compras: 35000 },
    { month: 'Abr', ventas: 61000, compras: 42000 },
    { month: 'May', ventas: 55000, compras: 39000 },
    { month: 'Jun', ventas: 67000, compras: 45000 },
  ];

  const categoryData = [
    { name: 'Informática', value: 45 },
    { name: 'Material Oficina', value: 30 },
    { name: 'Mobiliario', value: 15 },
    { name: 'Otros', value: 10 },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Visión general de tu negocio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Ventas Totales</p>
                  <p className="text-3xl font-bold mt-2">€{stats.totalSales.toLocaleString()}</p>
                  <p className="text-indigo-200 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stats.recentSales} en el último mes
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Compras Totales</p>
                  <p className="text-3xl font-bold mt-2">€{stats.totalPurchases.toLocaleString()}</p>
                  <p className="text-green-200 text-xs mt-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {stats.recentPurchases} en el último mes
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <ShoppingCart className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Clientes</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalCustomers}</p>
                  <p className="text-blue-200 text-xs mt-2">Clientes activos</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Productos</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                  {stats.lowStock > 0 && (
                    <p className="text-amber-200 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {stats.lowStock} con stock bajo
                    </p>
                  )}
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Package className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-xl">Ventas vs Compras</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="compras" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-xl">Productos por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { ProductStock } from "@/api/entities";
import { Product } from "@/api/entities";
import { Warehouse } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";

export default function ProductStockPage() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [stockData, prods, whs] = await Promise.all([
      ProductStock.list(),
      Product.filter({ manages_stock: true }),
      Warehouse.filter({ is_active: true })
    ]);
    setStocks(stockData);
    setProducts(prods);
    setWarehouses(whs);
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesWarehouse = selectedWarehouse === "all" || stock.warehouse_id === selectedWarehouse;
    const matchesSearch = !searchTerm || 
      stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  const getStockBadge = (stock, minStock) => {
    if (stock <= 0) {
      return <Badge className="bg-red-100 text-red-800">Sin stock</Badge>;
    }
    if (minStock && stock < minStock) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stock bajo</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock por Almacén</h1>
            <p className="text-gray-500 mt-1">Consulta de stock disponible en cada almacén</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Inventario</CardTitle>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-64">
                  <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los almacenes</SelectItem>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Reservado</TableHead>
                  <TableHead>Stock Disponible</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => {
                  const product = products.find(p => p.id === stock.product_id);
                  return (
                    <TableRow key={stock.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{stock.product_code}</TableCell>
                      <TableCell>{stock.product_name}</TableCell>
                      <TableCell>{stock.warehouse_name}</TableCell>
                      <TableCell className="font-semibold">{stock.current_stock}</TableCell>
                      <TableCell className="text-gray-600">{stock.reserved_stock}</TableCell>
                      <TableCell className="font-semibold text-green-600">{stock.available_stock}</TableCell>
                      <TableCell>{getStockBadge(stock.current_stock, product?.min_stock)}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredStocks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      No se encontraron registros de stock
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { StockMovement } from "@/api/entities";
import { Warehouse } from "@/api/entities";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import StockMovementForm from "../components/stock/StockMovementForm";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [movs, whs, prods] = await Promise.all([
      StockMovement.list("-movement_date"),
      Warehouse.list(),
      Product.list()
    ]);
    setMovements(movs);
    setWarehouses(whs);
    setProducts(prods);
  };

  const handleSave = async (movementData) => {
    if (editingMovement) {
      await StockMovement.update(editingMovement.id, movementData);
    } else {
      await StockMovement.create(movementData);
    }
    setShowForm(false);
    setEditingMovement(null);
    loadData();
  };

  const handleEdit = (movement) => {
    setEditingMovement(movement);
    setShowForm(true);
  };

  const getMovementTypeBadge = (type) => {
    const colors = {
      entrada: "bg-green-100 text-green-800",
      salida: "bg-red-100 text-red-800",
      traspaso_entrada: "bg-blue-100 text-blue-800",
      traspaso_salida: "bg-purple-100 text-purple-800",
      ajuste: "bg-gray-100 text-gray-800"
    };
    return colors[type] || colors.ajuste;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Movimientos de Stock</h1>
            <p className="text-gray-500 mt-1">Registro de entradas y salidas de almacén</p>
          </div>
          <Button 
            onClick={() => {
              setEditingMovement(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Movimiento
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle>Historial de Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Lote/Serie</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-gray-50">
                    <TableCell>{format(new Date(movement.movement_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getMovementTypeBadge(movement.movement_type)}>
                        {movement.movement_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.warehouse_name}</TableCell>
                    <TableCell>{movement.product_name}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>
                      {movement.batch_number && <span className="text-xs">L: {movement.batch_number}</span>}
                      {movement.serial_number && <span className="text-xs">S: {movement.serial_number}</span>}
                      {!movement.batch_number && !movement.serial_number && <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(movement)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <StockMovementForm
          movement={editingMovement}
          warehouses={warehouses}
          products={products}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingMovement(null);
          }}
        />
      )}
    </div>
  );
}
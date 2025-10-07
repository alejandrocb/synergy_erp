import React, { useState, useEffect } from "react";
import { WarehouseTransfer } from "@/api/entities";
import { TransferLine } from "@/api/entities";
import { Warehouse } from "@/api/entities";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import TransferForm from "../components/transfers/TransferForm";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [trans, whs, prods] = await Promise.all([
      WarehouseTransfer.list("-transfer_date"),
      Warehouse.list(),
      Product.list()
    ]);
    setTransfers(trans);
    setWarehouses(whs);
    setProducts(prods);
  };

  const handleSave = async (transferData, lines) => {
    if (editingTransfer) {
      await WarehouseTransfer.update(editingTransfer.id, transferData);
      const existingLines = await TransferLine.filter({ transfer_id: editingTransfer.id });
      for (const line of existingLines) {
        await TransferLine.delete(line.id);
      }
      for (const line of lines) {
        await TransferLine.create({ ...line, transfer_id: editingTransfer.id });
      }
    } else {
      const transfer = await WarehouseTransfer.create(transferData);
      for (const line of lines) {
        await TransferLine.create({ ...line, transfer_id: transfer.id });
      }
    }
    setShowForm(false);
    setEditingTransfer(null);
    loadData();
  };

  const handleEdit = async (transfer) => {
    const lines = await TransferLine.filter({ transfer_id: transfer.id });
    setEditingTransfer({ ...transfer, lines });
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      en_transito: "bg-blue-100 text-blue-800",
      completado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pendiente;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Traspasos entre Almacenes</h1>
            <p className="text-gray-500 mt-1">Gestión de movimientos internos de stock</p>
          </div>
          <Button 
            onClick={() => {
              setEditingTransfer(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Traspaso
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle>Historial de Traspasos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{transfer.transfer_number}</TableCell>
                    <TableCell>{format(new Date(transfer.transfer_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{transfer.from_warehouse_name}</TableCell>
                    <TableCell>{transfer.to_warehouse_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(transfer.status)}>
                        {transfer.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transfer)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {transfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No hay traspasos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <TransferForm
          transfer={editingTransfer}
          warehouses={warehouses}
          products={products}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTransfer(null);
          }}
        />
      )}
    </div>
  );
}
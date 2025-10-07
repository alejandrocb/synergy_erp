import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export default function TransferForm({ transfer, warehouses, products, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    transfer_number: transfer?.transfer_number || "",
    from_warehouse_id: transfer?.from_warehouse_id || "",
    from_warehouse_name: transfer?.from_warehouse_name || "",
    to_warehouse_id: transfer?.to_warehouse_id || "",
    to_warehouse_name: transfer?.to_warehouse_name || "",
    transfer_date: transfer?.transfer_date || new Date().toISOString().split('T')[0],
    status: transfer?.status || "pendiente",
    notes: transfer?.notes || ""
  });
  const [lines, setLines] = useState(transfer?.lines || []);

  const addLine = () => {
    setLines([...lines, {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: 1,
      batch_number: "",
      serial_number: ""
    }]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newLines[index].product_code = product.code;
        newLines[index].product_name = product.name;
      }
    }
    
    setLines(newLines);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fromWarehouse = warehouses.find(w => w.id === formData.from_warehouse_id);
    const toWarehouse = warehouses.find(w => w.id === formData.to_warehouse_id);
    
    onSave({
      ...formData,
      from_warehouse_name: fromWarehouse?.name || "",
      to_warehouse_name: toWarehouse?.name || ""
    }, lines);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transfer ? "Editar Traspaso" : "Nuevo Traspaso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número de Traspaso *</Label>
              <Input
                value={formData.transfer_number}
                onChange={(e) => setFormData({...formData, transfer_number: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.transfer_date}
                onChange={(e) => setFormData({...formData, transfer_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Almacén Origen *</Label>
              <Select
                value={formData.from_warehouse_id}
                onValueChange={(value) => setFormData({...formData, from_warehouse_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Almacén Destino *</Label>
              <Select
                value={formData.to_warehouse_id}
                onValueChange={(value) => setFormData({...formData, to_warehouse_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_transito">En Tránsito</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Productos a Traspasar</Label>
              <Button type="button" onClick={addLine} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Producto
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Serie</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={line.product_id}
                          onValueChange={(value) => updateLine(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.batch_number || ""}
                          onChange={(e) => updateLine(index, 'batch_number', e.target.value)}
                          placeholder="Lote"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.serial_number || ""}
                          onChange={(e) => updateLine(index, 'serial_number', e.target.value)}
                          placeholder="Serie"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
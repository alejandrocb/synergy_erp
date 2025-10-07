import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function StockMovementForm({ movement, warehouses, products, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    movement_type: movement?.movement_type || "entrada",
    movement_date: movement?.movement_date || new Date().toISOString().split('T')[0],
    warehouse_id: movement?.warehouse_id || "",
    warehouse_name: movement?.warehouse_name || "",
    product_id: movement?.product_id || "",
    product_code: movement?.product_code || "",
    product_name: movement?.product_name || "",
    quantity: movement?.quantity || 1,
    batch_number: movement?.batch_number || "",
    serial_number: movement?.serial_number || "",
    reference_document: movement?.reference_document || "",
    notes: movement?.notes || ""
  });

  const handleWarehouseChange = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setFormData({
        ...formData,
        warehouse_id: warehouseId,
        warehouse_name: warehouse.name
      });
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        product_id: productId,
        product_code: product.code,
        product_name: product.name
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{movement ? "Editar Movimiento" : "Nuevo Movimiento de Stock"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento *</Label>
              <Select
                value={formData.movement_type}
                onValueChange={(value) => setFormData({...formData, movement_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="traspaso_entrada">Traspaso Entrada</SelectItem>
                  <SelectItem value="traspaso_salida">Traspaso Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.movement_date}
                onChange={(e) => setFormData({...formData, movement_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Almacén *</Label>
              <Select
                value={formData.warehouse_id}
                onValueChange={handleWarehouseChange}
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
              <Label>Producto *</Label>
              <Select
                value={formData.product_id}
                onValueChange={handleProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Número de Lote</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Número de Serie</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Documento de Referencia</Label>
            <Input
              value={formData.reference_document}
              onChange={(e) => setFormData({...formData, reference_document: e.target.value})}
              placeholder="Ej: ALB-2024-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
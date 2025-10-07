import React, { useState, useEffect } from "react";
import { TaxRate } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function PurchaseDocumentForm({ document, documentType = "factura", suppliers, products, onSave, onCancel }) {
  const [taxRates, setTaxRates] = useState([]);
  
  const [formData, setFormData] = useState({
    document_number: document?.document_number || "AUTO",
    document_type: documentType || document?.document_type || "presupuesto",
    document_date: document?.document_date || new Date().toISOString().split('T')[0],
    supplier_id: document?.supplier_id || "",
    supplier_name: document?.supplier_name || "",
    supplier_tax_id: document?.supplier_tax_id || "",
    status: documentType || document?.status || "presupuesto",
    subtotal: document?.subtotal || 0,
    tax_amount: document?.tax_amount || 0,
    total_amount: document?.total_amount || 0,
    notes: document?.notes || ""
  });

  const [lines, setLines] = useState(document?.lines || []);

  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    const taxes = await TaxRate.filter({ is_active: true });
    setTaxRates(taxes.filter(t => t.type === 'purchase' || t.type === 'both'));
  };

  const addLine = () => {
    const defaultTaxRate = taxRates.length > 0 ? taxRates[0] : { id: "", rate: 0 };
    setLines([...lines, {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate_id: defaultTaxRate.id,
      tax_rate: defaultTaxRate.rate,
      line_total: 0
    }]);
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
    calculateTotals(newLines);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        const taxRate = taxRates.find(t => t.id === product.purchase_tax_rate_id);
        newLines[index].product_code = product.code;
        newLines[index].product_name = product.name;
        newLines[index].unit_price = product.purchase_price;
        newLines[index].tax_rate_id = product.purchase_tax_rate_id || (taxRates.length > 0 ? taxRates[0].id : "");
        newLines[index].tax_rate = taxRate ? taxRate.rate : 0;
      }
    }
    
    if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
      const quantity = parseFloat(newLines[index].quantity) || 0;
      const unitPrice = parseFloat(newLines[index].unit_price) || 0;
      newLines[index].line_total = quantity * unitPrice;
    }

    if (field === 'tax_rate_id') {
      const taxRate = taxRates.find(t => t.id === value);
      newLines[index].tax_rate = taxRate ? taxRate.rate : 0;
    }
    
    setLines(newLines);
    calculateTotals(newLines);
  };

  const calculateTotals = (currentLines) => {
    const subtotal = currentLines.reduce((sum, line) => sum + (parseFloat(line.line_total) || 0), 0);
    const taxAmount = currentLines.reduce((sum, line) => {
      const lineTotal = parseFloat(line.line_total) || 0;
      const taxRate = parseFloat(line.tax_rate) || 0;
      return sum + (lineTotal * taxRate / 100);
    }, 0);
    const totalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData({
        ...formData,
        supplier_id: supplierId,
        supplier_name: supplier.business_name,
        supplier_tax_id: supplier.tax_id
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, lines);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Editar Documento" : `Nuevo ${documentType || 'Documento'} de Compra`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Número de Documento</Label>
              <Input
                value={formData.document_number}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Se asignará automáticamente</p>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Input
                value={documentType || formData.document_type}
                disabled
                className="bg-gray-100 capitalize"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.document_date}
                onChange={(e) => setFormData({...formData, document_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proveedor *</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={handleSupplierChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.business_name} - {supplier.tax_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Líneas del Documento</Label>
              <Button type="button" onClick={addLine} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Línea
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Impuesto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={line.product_id || ""}
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
                          onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.tax_rate_id || ""}
                          onValueChange={(value) => updateLine(index, 'tax_rate_id', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Impuesto" />
                          </SelectTrigger>
                          <SelectContent>
                            {taxRates.map((tax) => (
                              <SelectItem key={tax.id} value={tax.id}>
                                {tax.name} ({tax.rate}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">€{(line.line_total || 0).toFixed(2)}</span>
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

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">€{formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-semibold">€{formData.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-600">€{formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
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
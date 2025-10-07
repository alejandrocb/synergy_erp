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

export default function SaleDocumentForm({ document, documentType = "factura", customers, products, onSave, onCancel }) {
  const [taxRates, setTaxRates] = useState([]);

  const [formData, setFormData] = useState({
    document_number: document?.document_number || "AUTO",
    document_type: documentType || document?.document_type || "presupuesto",
    document_date: document?.document_date || new Date().toISOString().split('T')[0],
    customer_id: document?.customer_id || "",
    customer_name: document?.customer_name || "",
    customer_tax_id: document?.customer_tax_id || "",
    status: document?.status || documentType,
    subtotal: document?.subtotal || 0,
    tax_amount: document?.tax_amount || 0,
    total_amount: document?.total_amount || 0,
    notes: document?.notes || ""
  });

  const [lines, setLines] = useState(document?.lines || []);

  useEffect(() => {
    loadTaxRates();
  }, []);

  useEffect(() => {
    calculateTotals(lines);
  }, [lines, taxRates]);

  const loadTaxRates = async () => {
    try {
      const taxes = await TaxRate.filter({ is_active: true });
      setTaxRates(taxes.filter(t => t.type === 'sale' || t.type === 'both'));
    } catch (error) {
      console.error("Error loading tax rates:", error);
    }
  };

  const addLine = () => {
    setLines([...lines, {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate_id: "",
      tax_rate: 0,
      discount_percentage: 0,
      line_total: 0
    }]);
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    if (['quantity', 'unit_price', 'discount_percentage', 'tax_rate'].includes(field)) {
      newLines[index][field] = parseFloat(value) || 0;
    }

    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newLines[index].product_code = product.code;
        newLines[index].product_name = product.name;
        newLines[index].unit_price = parseFloat(product.sale_price) || 0;
        newLines[index].tax_rate_id = product.sale_tax_rate_id || "";

        const taxRateObj = taxRates.find(t => t.id === product.sale_tax_rate_id);
        newLines[index].tax_rate = taxRateObj ? parseFloat(taxRateObj.rate) || 0 : 0;
      } else {
        newLines[index].product_code = "";
        newLines[index].product_name = "";
        newLines[index].unit_price = 0;
        newLines[index].tax_rate_id = "";
        newLines[index].tax_rate = 0;
      }
    }
    
    if (field === 'product_id' || field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
      const quantity = parseFloat(newLines[index].quantity) || 0;
      const unitPrice = parseFloat(newLines[index].unit_price) || 0;
      const discount = parseFloat(newLines[index].discount_percentage) || 0;
      newLines[index].line_total = quantity * unitPrice * (1 - discount / 100);
    }

    if (field === 'tax_rate_id') {
      const taxRateObj = taxRates.find(t => t.id === value);
      newLines[index].tax_rate = taxRateObj ? parseFloat(taxRateObj.rate) || 0 : 0;
    }
    
    setLines(newLines);
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
      subtotal: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        customer_name: customer.business_name,
        customer_tax_id: customer.tax_id
      });
    } else {
      setFormData({
        ...formData,
        customer_id: "",
        customer_name: "",
        customer_tax_id: ""
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
        alert("Por favor, seleccione un cliente.");
        return;
    }
    const validLines = lines.filter(line => line.product_id && (parseFloat(line.quantity) || 0) > 0);
    if (validLines.length === 0) {
      alert("Por favor, añada al menos una línea de producto válida.");
      return;
    }
    
    onSave(formData, validLines);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Editar Documento" : `Nuevo ${documentType ? documentType.charAt(0).toUpperCase() + documentType.slice(1) : 'Documento'}`}</DialogTitle>
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
                value={documentType ? documentType.charAt(0).toUpperCase() + documentType.slice(1) : formData.document_type}
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
            <Label>Cliente *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={handleCustomerChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.business_name} - {customer.tax_id}
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
                    <TableHead className="w-20">Cantidad</TableHead>
                    <TableHead className="w-24">Precio Unit.</TableHead>
                    <TableHead className="w-20">Desc. %</TableHead>
                    <TableHead className="w-32">Impuesto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-12"></TableHead>
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
                        <Input
                          type="number"
                          step="0.01"
                          value={line.discount_percentage || 0}
                          onChange={(e) => updateLine(index, 'discount_percentage', e.target.value)}
                          className="w-20"
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
                      <TableCell className="font-semibold">
                        €{(line.line_total || 0).toFixed(2)}
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
                  <span className="font-bold text-indigo-600">€{formData.total_amount.toFixed(2)}</span>
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
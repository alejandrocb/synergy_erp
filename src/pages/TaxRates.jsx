import React, { useState, useEffect } from "react";
import { TaxRate } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TaxRates() {
  const [taxRates, setTaxRates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    rate: 0,
    type: "both",
    is_default: false,
    is_active: true,
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await TaxRate.list();
    setTaxRates(data);
  };

  const handleEdit = (taxRate) => {
    setEditingTaxRate(taxRate);
    setFormData(taxRate);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingTaxRate(null);
    setFormData({
      code: "",
      name: "",
      rate: 0,
      type: "both",
      is_default: false,
      is_active: true,
      description: ""
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingTaxRate) {
      await TaxRate.update(editingTaxRate.id, formData);
    } else {
      await TaxRate.create(formData);
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Está seguro de eliminar este tipo de impuesto?")) {
      await TaxRate.delete(id);
      loadData();
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      purchase: "Compras",
      sale: "Ventas",
      both: "Ambos"
    };
    return labels[type] || type;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipos de Impuesto</h1>
            <p className="text-gray-500 mt-1">Gestión de impuestos</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Impuesto
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle>Listado de Tipos de Impuesto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tasa</TableHead>
                  <TableHead>Aplicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRates.map((taxRate) => (
                  <TableRow key={taxRate.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{taxRate.code}</TableCell>
                    <TableCell>{taxRate.name}</TableCell>
                    <TableCell className="font-semibold">{taxRate.rate}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(taxRate.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={taxRate.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {taxRate.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(taxRate)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(taxRate.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTaxRate ? "Editar" : "Nuevo"} Tipo de Impuesto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tasa (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aplicación</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Solo Ventas</SelectItem>
                      <SelectItem value="purchase">Solo Compras</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
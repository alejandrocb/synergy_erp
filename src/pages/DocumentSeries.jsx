
import React, { useState, useEffect } from "react";
import { DocumentSeries } from "@/api/entities";
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

export default function DocumentSeriesPage() {
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [formData, setFormData] = useState({
    document_type: "factura_venta",
    series_key: "",
    last_number: 0,
    prefix: "",
    is_default: false, // Added 'is_default' field
    is_active: true,
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DocumentSeries.list();
    setSeries(data);
  };

  const handleEdit = (serie) => {
    setEditingSeries(serie);
    setFormData(serie); // Ensure existing 'is_default' value is loaded
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingSeries(null);
    setFormData({
      document_type: "factura_venta",
      series_key: "",
      last_number: 0,
      prefix: "",
      is_default: false, // Initialize 'is_default' for new series
      is_active: true,
      description: ""
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingSeries) {
      await DocumentSeries.update(editingSeries.id, formData);
    } else {
      await DocumentSeries.create(formData);
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Está seguro de eliminar esta serie?")) {
      await DocumentSeries.delete(id);
      loadData();
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      presupuesto_venta: "Presupuesto Venta",
      pedido_venta: "Pedido Venta",
      albaran_venta: "Albarán Venta",
      factura_venta: "Factura Venta",
      factura_simplificada: "Factura Simplificada", // Added new document type
      presupuesto_compra: "Presupuesto Compra",
      pedido_compra: "Pedido Compra",
      albaran_compra: "Albarán Compra",
      factura_compra: "Factura Compra"
    };
    return labels[type] || type;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Series de Documentos</h1>
            <p className="text-gray-500 mt-1">Gestión de numeración de documentos</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Serie
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle>Listado de Series</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tipo de Documento</TableHead>
                  <TableHead>Clave</TableHead>
                  <TableHead>Prefijo</TableHead>
                  <TableHead>Último Número</TableHead>
                  <TableHead>Por Defecto</TableHead> {/* New table header */}
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {series.map((serie) => (
                  <TableRow key={serie.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{getDocumentTypeLabel(serie.document_type)}</TableCell>
                    <TableCell>{serie.series_key}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{serie.prefix}</span>
                    </TableCell>
                    <TableCell className="text-lg font-semibold">{serie.last_number}</TableCell>
                    <TableCell>
                      {serie.is_default && (
                        <Badge className="bg-blue-100 text-blue-800">Por defecto</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={serie.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {serie.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(serie)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(serie.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {series.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400"> {/* Updated colSpan from 6 to 7 */}
                      No hay series configuradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSeries ? "Editar Serie" : "Nueva Serie"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Documento *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => setFormData({...formData, document_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presupuesto_venta">Presupuesto Venta</SelectItem>
                    <SelectItem value="pedido_venta">Pedido Venta</SelectItem>
                    <SelectItem value="albaran_venta">Albarán Venta</SelectItem>
                    <SelectItem value="factura_venta">Factura Venta</SelectItem>
                    <SelectItem value="factura_simplificada">Factura Simplificada (Ticket)</SelectItem> {/* Added new SelectItem */}
                    <SelectItem value="presupuesto_compra">Presupuesto Compra</SelectItem>
                    <SelectItem value="pedido_compra">Pedido Compra</SelectItem>
                    <SelectItem value="albaran_compra">Albarán Compra</SelectItem>
                    <SelectItem value="factura_compra">Factura Compra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clave de Serie *</Label>
                  <Input
                    value={formData.series_key}
                    onChange={(e) => setFormData({...formData, series_key: e.target.value})}
                    placeholder="Ej: FAC-2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Último Número *</Label>
                  <Input
                    type="number"
                    value={formData.last_number}
                    onChange={(e) => setFormData({...formData, last_number: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prefijo *</Label>
                <Input
                  value={formData.prefix}
                  onChange={(e) => setFormData({...formData, prefix: e.target.value})}
                  placeholder="Ej: ALB-V"
                  required
                />
                <p className="text-xs text-gray-500">
                  El año se añadirá automáticamente al generar el documento
                </p>
              </div>

              <div className="flex items-center space-x-2"> {/* New 'is_default' checkbox */}
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Marcar como serie por defecto para este tipo de documento
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Descripción de la serie..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Ejemplos de números generados:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Con fecha de 2024: <span className="font-mono font-semibold">{formData.prefix}-2024-{String(formData.last_number + 1).padStart(5, '0')}</span></li>
                  <li>• Con fecha de 2025: <span className="font-mono font-semibold">{formData.prefix}-2025-{String(formData.last_number + 1).padStart(5, '0')}</span></li>
                </ul>
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

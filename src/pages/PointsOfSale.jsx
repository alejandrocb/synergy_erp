import React, { useState, useEffect } from "react";
import { PointOfSale } from "@/api/entities";
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

export default function PointsOfSale() {
  const [pointsOfSale, setPointsOfSale] = useState([]);
  const [series, setSeries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    location: "",
    custom_document_series_id: "",
    ticket_header: "",
    ticket_footer: "",
    company_name: "",
    company_tax_id: "",
    company_address: "",
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pos, ser] = await Promise.all([
      PointOfSale.list(),
      DocumentSeries.list()
    ]);
    setPointsOfSale(pos);
    setSeries(ser);
  };

  const handleEdit = (pos) => {
    setEditingPos(pos);
    setFormData(pos);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPos(null);
    setFormData({
      code: "",
      name: "",
      location: "",
      custom_document_series_id: "",
      ticket_header: "",
      ticket_footer: "",
      company_name: "",
      company_tax_id: "",
      company_address: "",
      is_active: true
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingPos) {
      await PointOfSale.update(editingPos.id, formData);
    } else {
      await PointOfSale.create(formData);
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Está seguro de eliminar este punto de venta?")) {
      await PointOfSale.delete(id);
      loadData();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Puntos de Venta</h1>
            <p className="text-gray-500 mt-1">Gestión de TPVs y configuración de tickets</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Punto de Venta
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle>Listado de Puntos de Venta</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Serie Personalizada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsOfSale.map((pos) => (
                  <TableRow key={pos.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{pos.code}</TableCell>
                    <TableCell>{pos.name}</TableCell>
                    <TableCell>{pos.location}</TableCell>
                    <TableCell>
                      {pos.custom_document_series_id ? (
                        <Badge variant="outline">Personalizada</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Por defecto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={pos.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {pos.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pos)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pos.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pointsOfSale.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No hay puntos de venta configurados
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPos ? "Editar Punto de Venta" : "Nuevo Punto de Venta"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Ej: TPV01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: TPV Tienda Centro"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ej: Planta Baja, Mostrador 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Serie de Facturación Personalizada</Label>
                <Select
                  value={formData.custom_document_series_id}
                  onValueChange={(value) => setFormData({...formData, custom_document_series_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Por defecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Por defecto</SelectItem>
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.series_key} - {s.prefix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Si no se especifica, se usará la serie por defecto del tipo de documento
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Datos de la Empresa (para tickets)</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Empresa</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Ej: Mi Empresa S.L."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CIF</Label>
                      <Input
                        value={formData.company_tax_id}
                        onChange={(e) => setFormData({...formData, company_tax_id: e.target.value})}
                        placeholder="Ej: B12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <Input
                        value={formData.company_address}
                        onChange={(e) => setFormData({...formData, company_address: e.target.value})}
                        placeholder="Ej: C/ Principal 123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Configuración de Tickets</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Encabezado del Ticket</Label>
                    <Textarea
                      value={formData.ticket_header}
                      onChange={(e) => setFormData({...formData, ticket_header: e.target.value})}
                      rows={4}
                      placeholder="Bienvenido a nuestra tienda&#10;Tel: 912345678&#10;www.miempresa.com"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Cada línea será una línea del ticket</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Pie del Ticket</Label>
                    <Textarea
                      value={formData.ticket_footer}
                      onChange={(e) => setFormData({...formData, ticket_footer: e.target.value})}
                      rows={4}
                      placeholder="¡Gracias por su compra!&#10;Conserve este ticket&#10;Devoluciones en 15 días"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
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
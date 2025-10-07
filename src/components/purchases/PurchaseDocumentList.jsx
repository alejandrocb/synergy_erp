import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export default function PurchaseDocumentList({ documents, onEdit }) {
  const getStatusBadge = (status) => {
    const colors = {
      presupuesto: "bg-gray-100 text-gray-800",
      pedido: "bg-blue-100 text-blue-800",
      proforma: "bg-purple-100 text-purple-800",
      albaran: "bg-orange-100 text-orange-800",
      factura: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.presupuesto;
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="border-b bg-white">
        <CardTitle>Documentos de Compra</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{doc.document_number}</TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.document_type}</Badge>
                </TableCell>
                <TableCell>{doc.supplier_name}</TableCell>
                <TableCell>{format(new Date(doc.document_date), "dd/MM/yyyy")}</TableCell>
                <TableCell className="font-semibold">€{doc.total_amount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(doc.status)}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(doc)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No hay documentos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { SaleDocument } from "@/api/entities";
import { SaleLine } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Product } from "@/api/entities";
import { DocumentSeries } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentList from "../components/sales/DocumentList";
import SaleDocumentForm from "../components/sales/SaleDocumentForm";

export default function SalesDeliveries() {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [docs, custs, prods] = await Promise.all([
      SaleDocument.filter({ document_type: "albaran" }, "-document_date"),
      Customer.list(),
      Product.list()
    ]);
    setDocuments(docs);
    setCustomers(custs);
    setProducts(prods);
  };

  const getNextDocumentNumber = async (documentDate) => {
    const series = await DocumentSeries.filter({ document_type: "albaran_venta", is_active: true });
    if (series.length === 0) {
      alert("No hay series activas para albaranes de venta. Por favor, configure una serie primero.");
      return null;
    }
    
    const activeSeries = series[0];
    const nextNumber = activeSeries.last_number + 1;
    const year = new Date(documentDate).getFullYear();
    // Construct the document number with the year as prefix, then year, then incrementing number
    const documentNumber = `${activeSeries.prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
    
    await DocumentSeries.update(activeSeries.id, { last_number: nextNumber });
    
    return documentNumber;
  };

  const handleSave = async (documentData, lines) => {
    if (editingDocument) {
      await SaleDocument.update(editingDocument.id, documentData);
      const existingLines = await SaleLine.filter({ sale_document_id: editingDocument.id });
      for (const line of existingLines) {
        await SaleLine.delete(line.id);
      }
      for (const line of lines) {
        await SaleLine.create({ ...line, sale_document_id: editingDocument.id });
      }
    } else {
      // Pass the document_date from documentData to getNextDocumentNumber
      const documentNumber = await getNextDocumentNumber(documentData.document_date);
      if (!documentNumber) return;
      
      const doc = await SaleDocument.create({ ...documentData, document_number: documentNumber });
      for (const line of lines) {
        await SaleLine.create({ ...line, sale_document_id: doc.id });
      }
    }
    setShowForm(false);
    setEditingDocument(null);
    loadData();
  };

  const handleEdit = async (doc) => {
    const lines = await SaleLine.filter({ sale_document_id: doc.id });
    setEditingDocument({ ...doc, lines });
    setShowForm(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Albaranes de Venta</h1>
            <p className="text-gray-500 mt-1">Gestión de albaranes de entrega</p>
          </div>
          <Button 
            onClick={() => {
              setEditingDocument(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Albarán
          </Button>
        </div>

        <DocumentList 
          documents={documents}
          onEdit={handleEdit}
        />
      </div>

      {showForm && (
        <SaleDocumentForm
          document={editingDocument}
          documentType="albaran"
          customers={customers}
          products={products}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingDocument(null);
          }}
        />
      )}
    </div>
  );
}

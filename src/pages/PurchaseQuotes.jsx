
import React, { useState, useEffect } from "react";
import { PurchaseDocument } from "@/api/entities";
import { PurchaseLine } from "@/api/entities";
import { Supplier } from "@/api/entities";
import { Product } from "@/api/entities";
import { DocumentSeries } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PurchaseDocumentList from "../components/purchases/PurchaseDocumentList";
import PurchaseDocumentForm from "../components/purchases/PurchaseDocumentForm";

export default function PurchaseQuotes() {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [docs, supps, prods] = await Promise.all([
      PurchaseDocument.filter({ document_type: "presupuesto" }, "-document_date"),
      Supplier.list(),
      Product.list()
    ]);
    setDocuments(docs);
    setSuppliers(supps);
    setProducts(prods);
  };

  const getNextDocumentNumber = async (documentDate) => {
    const series = await DocumentSeries.filter({ document_type: "presupuesto_compra", is_active: true });
    if (series.length === 0) {
      alert("No hay series activas para presupuestos de compra. Por favor, configure una serie primero.");
      return null;
    }
    
    const activeSeries = series[0];
    const nextNumber = activeSeries.last_number + 1;
    const year = new Date(documentDate).getFullYear();
    const documentNumber = `${activeSeries.prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
    
    await DocumentSeries.update(activeSeries.id, { last_number: nextNumber });
    
    return documentNumber;
  };

  const handleSave = async (documentData, lines) => {
    if (editingDocument) {
      await PurchaseDocument.update(editingDocument.id, documentData);
      const existingLines = await PurchaseLine.filter({ purchase_document_id: editingDocument.id });
      for (const line of existingLines) {
        await PurchaseLine.delete(line.id);
      }
      for (const line of lines) {
        await PurchaseLine.create({ ...line, purchase_document_id: editingDocument.id });
      }
    } else {
      const documentNumber = await getNextDocumentNumber(documentData.document_date);
      if (!documentNumber) return;
      
      const doc = await PurchaseDocument.create({ ...documentData, document_number: documentNumber });
      for (const line of lines) {
        await PurchaseLine.create({ ...line, purchase_document_id: doc.id });
      }
    }
    setShowForm(false);
    setEditingDocument(null);
    loadData();
  };

  const handleEdit = async (doc) => {
    const lines = await PurchaseLine.filter({ purchase_document_id: doc.id });
    setEditingDocument({ ...doc, lines });
    setShowForm(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuestos de Compra</h1>
            <p className="text-gray-500 mt-1">Gestión de presupuestos de proveedores</p>
          </div>
          <Button 
            onClick={() => {
              setEditingDocument(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </div>

        <PurchaseDocumentList 
          documents={documents}
          onEdit={handleEdit}
        />
      </div>

      {showForm && (
        <PurchaseDocumentForm
          document={editingDocument}
          documentType="presupuesto"
          suppliers={suppliers}
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

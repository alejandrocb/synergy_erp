import React, { useState, useEffect } from "react";
import { SaleDocument } from "@/api/entities";
import { SaleLine } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Product } from "@/api/entities";
import { DocumentSeries } from "@/api/entities";
import { PointOfSale } from "@/api/entities";
import { useAuth } from "@/context/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentList from "../components/sales/DocumentList";
import SaleDocumentForm from "../components/sales/SaleDocumentForm";
import { reserveDocumentNumber } from "@/services/documentSeriesService";

export default function SalesSimplified() {
  const { user: currentUser } = useAuth();
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
      SaleDocument.filter({ document_type: "factura_simplificada" }, "-document_date"),
      Customer.list(),
      Product.list()
    ]);
    setDocuments(docs);
    setCustomers(custs);
    setProducts(prods);
  };

  const getNextDocumentNumber = async (documentData) => {
    try {
      const documentDate = documentData.document_date;
      let seriesId = null;

      if (documentData.point_of_sale_id) {
        const pos = await PointOfSale.filter({ id: documentData.point_of_sale_id });
        if (pos[0]?.custom_document_series_id) {
          seriesId = pos[0].custom_document_series_id;
        }
      }

      if (!seriesId && documentData.customer_id) {
        const customer = await Customer.filter({ id: documentData.customer_id });
        if (customer[0]?.custom_document_series_id) {
          seriesId = customer[0].custom_document_series_id;
        }
      }

      if (!seriesId && currentUser?.custom_document_series_id) {
        seriesId = currentUser.custom_document_series_id;
      }

      const { documentNumber } = await reserveDocumentNumber(DocumentSeries, {
        documentDate,
        documentType: seriesId ? undefined : "factura_simplificada",
        query: seriesId
          ? { id: seriesId }
          : {
              document_type: "factura_simplificada",
              is_default: true,
              is_active: true,
            },
      });

      return documentNumber;
    } catch (error) {
      if (error.code === "NO_ACTIVE_SERIES") {
        alert("No hay series configuradas para facturas simplificadas. Por favor, configure una serie primero.");
      } else {
        console.error("Error generating simplified invoice number", error);
        alert("No se pudo generar el número de documento. Inténtelo de nuevo.");
      }
      return null;
    }
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
      const documentNumber = await getNextDocumentNumber(documentData);
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
            <h1 className="text-3xl font-bold text-gray-900">Facturas Simplificadas (Tickets)</h1>
            <p className="text-gray-500 mt-1">Gestión de tickets y facturas simplificadas</p>
          </div>
          <Button 
            onClick={() => {
              setEditingDocument(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura Simplificada
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
          documentType="factura_simplificada"
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
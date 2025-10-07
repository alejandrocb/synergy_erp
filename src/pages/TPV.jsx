import React, { useState, useEffect } from "react";
import { SaleDocument } from "@/api/entities";
import { SaleLine } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Product } from "@/api/entities";
import { DocumentSeries } from "@/api/entities";
import { PointOfSale } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { reserveDocumentNumber } from "@/services/documentSeriesService";

export default function TPV() {
  const [pointOfSale, setPointOfSale] = useState(null);
  const [pointsOfSale, setPointsOfSale] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pos, custs, prods] = await Promise.all([
      PointOfSale.list(),
      Customer.list(),
      Product.list()
    ]);
    setPointsOfSale(pos);
    setCustomers(custs);
    setProducts(prods);
    
    if (pos.length > 0) {
      setPointOfSale(pos[0].id);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_code: product.code,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
        tax_rate: product.tax_rate,
        line_total: product.sale_price
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          line_total: item.unit_price * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = cart.reduce((sum, item) => {
      return sum + (item.line_total * item.tax_rate / 100);
    }, 0);
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    };
  };

  const getNextDocumentNumber = async (documentType, documentDate) => {
    try {
      const currentUser = await User.me();
      let seriesId = null;

      if (pointOfSale) {
        const pos = await PointOfSale.filter({ id: pointOfSale });
        if (pos[0]?.custom_document_series_id) {
          seriesId = pos[0].custom_document_series_id;
        }
      }

      if (!seriesId && selectedCustomer?.custom_document_series_id) {
        seriesId = selectedCustomer.custom_document_series_id;
      }

      if (!seriesId && currentUser.custom_document_series_id) {
        seriesId = currentUser.custom_document_series_id;
      }

      const seriesType = documentType === "albaran" ? "albaran_venta" : "factura_simplificada";

      const { documentNumber } = await reserveDocumentNumber(DocumentSeries, {
        documentDate,
        documentType: seriesId ? undefined : seriesType,
        query: seriesId
          ? { id: seriesId }
          : {
              document_type: seriesType,
              is_default: true,
              is_active: true,
            },
      });

      return documentNumber;
    } catch (error) {
      if (error.code === "NO_ACTIVE_SERIES") {
        throw new Error(`No hay series configuradas para ${documentType}`);
      }
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      setMessage({ type: "error", text: "Por favor, seleccione un cliente" });
      return;
    }

    if (cart.length === 0) {
      setMessage({ type: "error", text: "El carrito está vacío" });
      return;
    }

    try {
      const totals = calculateTotals();
      const documentDate = new Date().toISOString().split('T')[0];
      
      // Determinar tipo de documento según forma de pago
      const documentType = paymentMethod === "credito" ? "albaran" : "factura_simplificada";
      const status = documentType;
      
      const documentNumber = await getNextDocumentNumber(documentType, documentDate);
      
      const documentData = {
        document_number: documentNumber,
        document_type: documentType,
        document_date: documentDate,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.business_name,
        customer_tax_id: selectedCustomer.tax_id,
        point_of_sale_id: pointOfSale,
        payment_method: paymentMethod,
        status: status,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.total
      };

      const doc = await SaleDocument.create(documentData);
      
      for (const line of cart) {
        await SaleLine.create({ ...line, sale_document_id: doc.id });
      }

      const docTypeText = documentType === "albaran" ? "Albarán" : "Factura Simplificada";
      setMessage({ 
        type: "success", 
        text: `${docTypeText} ${documentNumber} creado correctamente` 
      });
      
      // Limpiar carrito
      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod("efectivo");
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Error al procesar la venta" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Terminal Punto de Venta</h1>
                <p className="text-sm text-gray-500">Venta rápida</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Punto de Venta</Label>
                <Select value={pointOfSale} onValueChange={setPointOfSale}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar TPV" />
                  </SelectTrigger>
                  <SelectContent>
                    {pointsOfSale.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Productos</CardTitle>
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 border-2 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                    >
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.code}</div>
                      <div className="text-lg font-bold text-indigo-600 mt-2">
                        €{product.sale_price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Carrito de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select 
                    value={selectedCustomer?.id} 
                    onValueChange={(value) => {
                      const customer = customers.find(c => c.id === value);
                      setSelectedCustomer(customer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.business_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cart Items */}
                <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Carrito vacío</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product_id} className="p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product_name}</div>
                            <div className="text-xs text-gray-500">€{item.unit_price.toFixed(2)} /ud</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="font-bold text-indigo-600">
                            €{item.line_total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">€{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA:</span>
                    <span className="font-semibold">€{totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-indigo-600">€{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Forma de Pago</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod("efectivo")}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "efectivo" 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="text-xs font-medium">Efectivo</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("tarjeta")}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "tarjeta" 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs font-medium">Tarjeta</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("credito")}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "credito" 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span className="text-xs font-medium">Crédito</span>
                    </button>
                  </div>
                  {paymentMethod === "credito" && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      Se generará un albarán. La factura se emitirá posteriormente.
                    </p>
                  )}
                  {(paymentMethod === "efectivo" || paymentMethod === "tarjeta") && (
                    <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      Se generará una factura simplificada.
                    </p>
                  )}
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !selectedCustomer}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                >
                  Cobrar €{totals.total.toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
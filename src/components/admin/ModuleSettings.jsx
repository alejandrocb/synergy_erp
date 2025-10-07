import React, { useState, useEffect } from "react";
import { CompanySettings } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Package, Users, Building2, Warehouse, ShoppingCart, ShoppingBag, TrendingUp, ArrowLeftRight, Tag } from "lucide-react";

const MODULES = [
  { key: "productos", label: "Productos", description: "Gestión del catálogo de productos", icon: Package },
  { key: "clientes", label: "Clientes", description: "Gestión de clientes", icon: Users },
  { key: "proveedores", label: "Proveedores", description: "Gestión de proveedores", icon: Building2 },
  { key: "almacenes", label: "Almacenes", description: "Gestión de almacenes", icon: Warehouse },
  { key: "ventas", label: "Ventas", description: "Documentos de venta (presupuestos, pedidos, facturas...)", icon: ShoppingCart },
  { key: "compras", label: "Compras", description: "Documentos de compra (presupuestos, pedidos, facturas...)", icon: ShoppingBag },
  { key: "movimientos", label: "Movimientos de Stock", description: "Registro de entradas y salidas", icon: TrendingUp },
  { key: "traspasos", label: "Traspasos", description: "Traspasos entre almacenes", icon: ArrowLeftRight },
  { key: "trazabilidad", label: "Trazabilidad", description: "Gestión de lotes y números de serie", icon: Tag },
];

export default function ModuleSettings() {
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await CompanySettings.list();
      const modulesConfig = {};
      
      MODULES.forEach(module => {
        const setting = settings.find(s => s.setting_key === `module_${module.key}`);
        modulesConfig[module.key] = setting ? setting.setting_value === 'true' : true;
      });
      
      setModules(modulesConfig);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (moduleKey) => {
    setModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existingSettings = await CompanySettings.list();
      
      for (const module of MODULES) {
        const settingKey = `module_${module.key}`;
        const existingSetting = existingSettings.find(s => s.setting_key === settingKey);
        
        if (existingSetting) {
          await CompanySettings.update(existingSetting.id, {
            setting_key: settingKey,
            setting_value: modules[module.key] ? 'true' : 'false',
            description: module.description
          });
        } else {
          await CompanySettings.create({
            setting_key: settingKey,
            setting_value: modules[module.key] ? 'true' : 'false',
            description: module.description
          });
        }
      }
      
      setMessage({ type: "success", text: "Configuración guardada. Recarga la página para ver los cambios." });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la configuración" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-white">
          <CardTitle>Configuración de Módulos</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Activa o desactiva módulos según las necesidades de tu empresa. Los cambios se aplicarán después de recargar la página.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.key}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={module.key} className="text-base font-medium cursor-pointer">
                        {module.label}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={module.key}
                    checked={modules[module.key]}
                    onCheckedChange={() => handleToggle(module.key)}
                    className="ml-4"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Después de guardar los cambios, recarga la página para que los módulos desactivados desaparezcan del menú de navegación.
        </AlertDescription>
      </Alert>
    </div>
  );
}
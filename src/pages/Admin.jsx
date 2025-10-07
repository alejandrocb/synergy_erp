import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Users as UsersIcon, Settings } from "lucide-react";
import UserManagement from "../components/admin/UserManagement";
import ModuleSettings from "../components/admin/ModuleSettings";
import { useAuth } from "@/context/AuthContext.jsx";

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate(createPageUrl("Dashboard"));
      return;
    }

    setChecking(false);
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500 mt-1">Gestión de usuarios y configuración del sistema</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Módulos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="modules">
            <ModuleSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
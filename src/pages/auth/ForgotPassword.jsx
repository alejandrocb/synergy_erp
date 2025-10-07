import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      setResetToken(result);
      toast({
        title: 'Solicitud registrada',
        description: 'Utiliza el token generado para restablecer tu contraseña.',
      });
    } catch (err) {
      console.error(err);
      setError('No se ha podido generar el token. Verifica el correo e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Recuperar contraseña</CardTitle>
          <CardDescription>Genera un token temporal para restablecer tu acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico registrado</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Generando token…' : 'Generar token de recuperación'}
            </Button>
          </form>

          {resetToken && (
            <div className="mt-6 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-4 text-sm text-indigo-700">
              <p className="font-semibold">Token generado:</p>
              <p className="break-all font-mono text-xs mt-2">{resetToken.token}</p>
              <p className="mt-2 text-xs text-indigo-600">
                Caduca el {new Date(resetToken.expiresAt).toLocaleString('es-ES')}.
                Utilízalo en la pantalla de{' '}
                <Link to={`/reset-password?token=${encodeURIComponent(resetToken.token)}`} className="underline font-semibold">
                  restablecer contraseña
                </Link>
                .
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Volver al login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

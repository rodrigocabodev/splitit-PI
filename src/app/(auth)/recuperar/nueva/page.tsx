"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { actualizarPassword } from "@/app/(auth)/actions";

export default function NuevaPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await actualizarPassword(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center gap-2">
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña de al menos 6 caracteres.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmar">Repetir contraseña</Label>
            <Input id="confirmar" name="confirmar" type="password" required minLength={6} autoComplete="new-password" />
          </div>

          {error && (
            <p className="text-sm text-destructive inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

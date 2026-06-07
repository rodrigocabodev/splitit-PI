"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import { solicitarReset } from "@/app/(auth)/actions";

export default function RecuperarPage() {
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await solicitarReset(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEnviado(true);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center gap-2">
        <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace para que puedas crear una contraseña nueva.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {enviado ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="size-12 rounded-full bg-success/15 text-success flex items-center justify-center">
              <Check className="size-5" />
            </div>
            <p className="text-sm">
              Si el email está registrado, recibirás un enlace en unos minutos. Revisa tu bandeja de entrada (y spam).
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="size-3.5" /> Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
            </div>

            {error && (
              <p className="text-sm text-destructive inline-flex items-center gap-1.5">
                <AlertCircle className="size-3.5" /> {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground text-center inline-flex items-center gap-1.5 justify-center"
            >
              <ArrowLeft className="size-3.5" /> Volver al login
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

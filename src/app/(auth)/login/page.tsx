"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { login } from "@/app/(auth)/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center gap-2">
        <CardTitle className="text-2xl">
          Bienvenido a <span className="text-brand-gradient">SplitIt</span>
        </CardTitle>
        <CardDescription>Inicia sesión en tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>

          {error && (
            <p className="text-sm text-destructive inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Link
            href="/recuperar"
            className="text-xs text-muted-foreground hover:text-foreground text-center hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

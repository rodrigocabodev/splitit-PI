"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cambiarContrasena } from "./actions";

export default function SeguridadForm() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    const formData = new FormData(e.currentTarget);
    if (formData.get("password") !== formData.get("confirm")) {
      setMensaje("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    const result = await cambiarContrasena(formData);
    setMensaje(result?.error ?? "Contraseña actualizada correctamente.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input id="confirm" name="confirm" type="password" minLength={6} required />
      </div>
      {mensaje && (
        <p className={`text-sm ${mensaje.includes("correctamente") ? "text-green-600" : "text-red-500"}`}>
          {mensaje}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Actualizando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

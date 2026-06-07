"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarPerfil } from "./actions";

export default function DatosPersonalesForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [nombre, setNombre] = useState(fullName);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    const result = await actualizarPerfil(new FormData(e.currentTarget));
    setMensaje(result?.error ?? "Datos actualizados correctamente.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          name="full_name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Email</Label>
        <Input value={email} disabled className="opacity-60" />
        <p className="text-xs text-gray-400">El email no se puede cambiar.</p>
      </div>
      {mensaje && (
        <p className={`text-sm ${mensaje.includes("correctamente") ? "text-green-600" : "text-red-500"}`}>
          {mensaje}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}

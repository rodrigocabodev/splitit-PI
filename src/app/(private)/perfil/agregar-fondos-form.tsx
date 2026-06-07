"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agregarFondos } from "./actions";

const IMPORTES_RAPIDOS = [10, 20, 50, 100];

export default function AgregarFondosForm() {
  const [importe, setImporte] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const result = await agregarFondos(new FormData(e.currentTarget));
    if (result?.error) {
      setMensaje(result.error);
    } else {
      setMensaje("¡Fondos añadidos correctamente!");
      setImporte("");
      router.refresh(); // refresca el saldo y el historial
    }
    setLoading(false);
  }

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">Añadir fondos</p>

      {/* Importes rápidos */}
      <div className="flex gap-2">
        {IMPORTES_RAPIDOS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setImporte(String(v))}
            className={`flex-1 border rounded-lg py-1.5 text-sm transition ${
              importe === String(v) ? "bg-black text-white border-black" : "hover:bg-gray-50"
            }`}
          >
            {v} €
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="importe" className="sr-only">Importe personalizado</Label>
          <Input
            id="importe"
            name="importe"
            type="number"
            min="1"
            step="0.01"
            placeholder="Otro importe"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading || !importe}>
          {loading ? "Añadiendo..." : "Añadir"}
        </Button>
      </form>

      {mensaje && (
        <p className={`text-sm ${mensaje.includes("correctamente") ? "text-green-600" : "text-red-500"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

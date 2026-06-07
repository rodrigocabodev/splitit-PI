"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cancelarReserva, finalizarReserva, eliminarReserva } from "./actions";
import { formatFecha } from "@/lib/format";

const ESTADO_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  finished: "Finalizada",
};

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  pending: "secondary",
  finished: "secondary",
  cancelled: "destructive",
};

const FILTROS_ESTADO = ["todas", "confirmed", "finished", "cancelled"] as const;
type FiltroEstado = (typeof FILTROS_ESTADO)[number];

const FILTRO_LABELS: Record<FiltroEstado, string> = {
  todas: "Todas",
  confirmed: "Confirmadas",
  finished: "Finalizadas",
  cancelled: "Canceladas",
};

export default function AdminReservasClient({ reservas: inicial }: { reservas: any[] }) {
  const [reservas, setReservas] = useState(inicial);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");
  const [error, setError] = useState<string | null>(null);

  async function handleCancelar(id: number) {
    setLoadingId(id);
    setError(null);
    const result = await cancelarReserva(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setReservas(reservas.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
    }
    setLoadingId(null);
  }

  async function handleFinalizar(id: number) {
    setLoadingId(id);
    setError(null);
    const result = await finalizarReserva(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setReservas(reservas.map((r) => r.id === id ? { ...r, status: "finished" } : r));
    }
    setLoadingId(null);
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Eliminar esta reserva? Esta acción no se puede deshacer.")) return;
    setLoadingId(id);
    setError(null);
    const result = await eliminarReserva(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setReservas(reservas.filter((r) => r.id !== id));
    }
    setLoadingId(null);
  }

  const q = busqueda.trim().toLowerCase();
  const filtradas = reservas.filter((r: any) => {
    if (filtro !== "todas" && r.status !== filtro) return false;
    if (!q) return true;
    const titulo = r.services?.title?.toLowerCase() ?? "";
    const nombre = (r.profiles?.full_name ?? r.profiles?.email ?? "").toLowerCase();
    return titulo.includes(q) || nombre.includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar por servicio o usuario..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-sm"
      />

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center flex-wrap">
        {FILTROS_ESTADO.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? "default" : "outline"}
            onClick={() => setFiltro(f)}
          >
            {FILTRO_LABELS[f]}
          </Button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">
          {filtradas.length} de {reservas.length}
        </span>
      </div>

      {filtradas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {reservas.length === 0 ? "No hay reservas todavía." : "Sin resultados."}
        </p>
      ) : (
    <div className="flex flex-col gap-2">
      {filtradas.map((r: any) => {
        const fecha = new Date(r.start_time);
        const isLoading = loadingId === r.id;
        const isActive = r.status === "confirmed" || r.status === "pending";

        return (
          <div
            key={r.id}
            className="border rounded-xl px-4 py-3 flex items-center justify-between gap-4"
          >
            {/* Info */}
            <Link href={`/reservas/${r.id}`} className="flex-1 min-w-0 hover:opacity-70">
              <p className="font-medium text-sm truncate">{r.services?.title}</p>
              <p className="text-xs text-gray-400">
                {r.profiles?.full_name ?? r.profiles?.email} ·{" "}
                {formatFecha(fecha)}
              </p>
            </Link>

            {/* Estado + precio */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold">{r.total_price} €</span>
              <Badge variant={ESTADO_VARIANT[r.status]}>
                {ESTADO_LABELS[r.status]}
              </Badge>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 shrink-0">
              {isActive && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleFinalizar(r.id)}
                  >
                    Finalizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleCancelar(r.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancelar
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="destructive"
                disabled={isLoading}
                onClick={() => handleEliminar(r.id)}
              >
                {isLoading ? "..." : "Eliminar"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
      )}
    </div>
  );
}

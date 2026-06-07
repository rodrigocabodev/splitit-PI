"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelarReserva } from "./actions";

export default function CancelarButton({
  bookingId,
  pagados,
  totalReembolso,
}: {
  bookingId: number;
  pagados: number;
  totalReembolso: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Cierra con Escape, mueve el foco al diálogo al abrirlo
  // y restaura el foco al disparador al cerrarlo.
  useEffect(() => {
    if (!abierto) return;

    dialogRef.current?.focus();
    const trigger = triggerRef.current;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        setAbierto(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [abierto, loading]);

  async function handleConfirmar() {
    setLoading(true);
    setError(null);
    const result = await cancelarReserva(bookingId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!abierto) {
    return (
      <Button
        ref={triggerRef}
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        onClick={() => setAbierto(true)}
      >
        Cancelar reserva
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !loading && setAbierto(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancelar-titulo"
        aria-describedby="cancelar-descripcion"
        tabIndex={-1}
        className="bg-white rounded-xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cancelar-titulo" className="font-bold text-lg">¿Cancelar la reserva?</h2>
        <p id="cancelar-descripcion" className="text-sm text-gray-600 leading-relaxed">
          Esta acción no se puede deshacer. La reserva quedará marcada como cancelada.
        </p>

        {pagados > 0 && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm">
            <p className="font-semibold text-amber-900 mb-1">Reembolsos automáticos</p>
            <p className="text-amber-800">
              Se devolverán <span className="font-bold">{totalReembolso.toFixed(2)} €</span> a la cartera de las {pagados} persona{pagados > 1 ? "s" : ""} que pagaron.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setAbierto(false)}
            disabled={loading}
          >
            Volver
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function AutoCancelCountdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [restantes, setRestantes] = useState(() => target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRestantes(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const segundosTotales = Math.max(0, Math.floor(restantes / 1000));
  const mm = String(Math.floor(segundosTotales / 60)).padStart(2, "0");
  const ss = String(segundosTotales % 60).padStart(2, "0");
  const agotado = restantes <= 0;

  return (
    <div className="border border-warning/40 bg-warning/10 text-warning-foreground text-sm rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="size-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Pago pendiente</p>
        <p className="text-xs opacity-90">
          {agotado
            ? "Esta reserva se cancelará en el próximo minuto si no se completan los pagos."
            : "Si no se completan los pagos, esta reserva se cancelará automáticamente en"}
        </p>
        {!agotado && (
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {mm}:{ss}
          </p>
        )}
      </div>
    </div>
  );
}

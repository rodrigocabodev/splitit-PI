"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pagarParticipante } from "./actions";

export default function PagarForm({
  participantId,
  bookingId,
  amount,
  walletBalance,
}: {
  participantId: number;
  bookingId: number;
  amount: number;
  walletBalance: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePagar(method: "wallet" | "card") {
    setLoading(true);
    setError(null);
    const result = await pagarParticipante(participantId, bookingId, method);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Si no hay error, revalidatePath recargará la página con estado "paid"
  }

  const saldoSuficiente = walletBalance >= amount;

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Tu parte pendiente</p>
        <p className="text-xl font-bold">{amount.toFixed(2)} €</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        variant="outline"
        className="w-full justify-between"
        disabled={loading || !saldoSuficiente}
        onClick={() => handlePagar("wallet")}
      >
        <span>{loading ? "Procesando..." : "Pagar con cartera"}</span>
        {!loading && (
          <span className={saldoSuficiente ? "text-green-600 font-bold" : "text-red-400"}>
            Saldo: {walletBalance.toFixed(2)} €
          </span>
        )}
      </Button>

      {!saldoSuficiente && (
        <p className="text-xs text-gray-400 text-center">
          Saldo insuficiente — recarga tu cartera en Mi perfil
        </p>
      )}

      <Button
        className="w-full"
        disabled={loading}
        onClick={() => handlePagar("card")}
      >
        {loading ? "Procesando..." : "Pagar con tarjeta"}
      </Button>
    </div>
  );
}

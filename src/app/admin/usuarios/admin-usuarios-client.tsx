"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleUsuarioAdmin } from "./actions";

type Usuario = {
  id: string;
  full_name: string | null;
  email: string;
  is_admin: boolean | null;
  wallet_balance: number | null;
  created_at: string;
};

export default function AdminUsuariosClient({
  usuarios: inicial,
  miId,
}: {
  usuarios: Usuario[];
  miId: string;
}) {
  const [lista, setLista] = useState(inicial);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, actual: boolean) {
    setError(null);
    setLoadingId(id);

    setLista((prev) => prev.map((u) => (u.id === id ? { ...u, is_admin: !actual } : u)));

    const result = await toggleUsuarioAdmin(id);
    if (result?.error) {
      setError(result.error);
      setLista((prev) => prev.map((u) => (u.id === id ? { ...u, is_admin: actual } : u)));
    }
    setLoadingId(null);
  }

  const q = busqueda.trim().toLowerCase();
  const filtrados = lista.filter((u) => {
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  const totalAdmins = lista.filter((u) => u.is_admin).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-xs text-gray-500">
          {totalAdmins} administrador{totalAdmins === 1 ? "" : "es"} · {lista.length} usuarios
        </span>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs">
            Cerrar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtrados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin resultados.</p>
        ) : (
          filtrados.map((u) => {
            const esYo = u.id === miId;
            return (
              <div
                key={u.id}
                className="border rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {u.full_name ?? "(sin nombre)"}
                    </p>
                    {u.is_admin && <Badge>Admin</Badge>}
                    {esYo && <Badge variant="secondary">Tú</Badge>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">
                    Saldo: {Number(u.wallet_balance ?? 0).toFixed(2)} €
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={u.is_admin ? "outline" : "default"}
                  onClick={() => handleToggle(u.id, !!u.is_admin)}
                  disabled={esYo || loadingId === u.id}
                  title={esYo ? "No puedes cambiar tu propio rol" : ""}
                >
                  {loadingId === u.id ? "…" : u.is_admin ? "Quitar admin" : "Hacer admin"}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

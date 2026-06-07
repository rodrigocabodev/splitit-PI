"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  toggleAutoCobro,
  eliminarAmigo,
} from "./actions";

type Amigo = {
  id: number;
  auto_pay_enabled: boolean;
  profiles: { full_name: string | null; email: string } | null;
};

type Solicitud = {
  id: number;
  profiles: { full_name: string | null; email: string } | null;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-black" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function AmigoRow({
  amigo,
  isLoading,
  onToggle,
  onEliminar,
}: {
  amigo: Amigo;
  isLoading: boolean;
  onToggle: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className="border rounded-xl px-4 py-3 flex items-center gap-3">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {amigo.profiles?.full_name ?? amigo.profiles?.email}
        </p>
        <p className="text-xs text-gray-400 truncate">{amigo.profiles?.email}</p>
      </div>

      {/* Auto-cobro toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-500 hidden sm:inline">Auto-cobro</span>
        <Toggle checked={amigo.auto_pay_enabled} onChange={onToggle} />
      </div>

      {/* Eliminar */}
      <Button
        size="sm"
        variant="ghost"
        disabled={isLoading}
        onClick={onEliminar}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0 px-2"
      >
        {isLoading ? "..." : "✕"}
      </Button>
    </div>
  );
}

export default function AmigosTab({
  amigos: inicial,
  solicitudesRecibidas: solicitudesIniciales,
}: {
  amigos: Amigo[];
  solicitudesRecibidas: Solicitud[];
}) {
  const [amigos, setAmigos] = useState(inicial);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [emailInput, setEmailInput] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  const conAutoCobro = amigos.filter((a) => a.auto_pay_enabled);
  const sinAutoCobro = amigos.filter((a) => !a.auto_pay_enabled);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEnviando(true);
    setMensaje(null);
    const result = await enviarSolicitud(emailInput.trim());
    if (result?.error) {
      setMensaje(result.error);
    } else {
      setMensaje("Solicitud enviada. Cuando la acepte aparecerá en tu lista.");
      setEmailInput("");
    }
    setEnviando(false);
  }

  async function handleAceptar(id: number) {
    setLoadingId(id);
    const result = await aceptarSolicitud(id);
    if (!result?.error) {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (solicitud) {
        setAmigos([...amigos, { id, auto_pay_enabled: false, profiles: solicitud.profiles }]);
      }
      setSolicitudes(solicitudes.filter((s) => s.id !== id));
    }
    setLoadingId(null);
  }

  async function handleRechazar(id: number) {
    setLoadingId(id);
    const result = await rechazarSolicitud(id);
    if (!result?.error) {
      setSolicitudes(solicitudes.filter((s) => s.id !== id));
    }
    setLoadingId(null);
  }

  async function handleToggle(id: number, valor: boolean) {
    setAmigos((prev) => prev.map((a) => (a.id === id ? { ...a, auto_pay_enabled: valor } : a)));
    const result = await toggleAutoCobro(id, valor);
    if (result?.error) {
      // Revertir el cambio si la acción falla
      setAmigos((prev) => prev.map((a) => (a.id === id ? { ...a, auto_pay_enabled: !valor } : a)));
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Eliminar este amigo de tu lista?")) return;
    setLoadingId(id);
    const result = await eliminarAmigo(id);
    if (!result?.error) {
      setAmigos(amigos.filter((a) => a.id !== id));
    }
    setLoadingId(null);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Solicitudes recibidas ── */}
      {solicitudes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Solicitudes pendientes{" "}
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold ml-1">
              {solicitudes.length}
            </span>
          </p>
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {s.profiles?.full_name ?? s.profiles?.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{s.profiles?.email}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" disabled={loadingId === s.id} onClick={() => handleAceptar(s.id)}>
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingId === s.id}
                  onClick={() => handleRechazar(s.id)}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Añadir amigo ── */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold">Añadir amigo</p>
        <form onSubmit={handleEnviar} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="email-amigo" className="sr-only">Email</Label>
            <Input
              id="email-amigo"
              type="email"
              placeholder="email@ejemplo.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={enviando || !emailInput.trim()}>
            {enviando ? "..." : "Enviar solicitud"}
          </Button>
        </form>
        {mensaje && (
          <p className={`text-sm ${mensaje.includes("enviada") ? "text-green-600" : "text-red-500"}`}>
            {mensaje}
          </p>
        )}
      </div>

      {/* ── Lista de amigos ── */}
      {amigos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 px-4 flex flex-col items-center gap-1">
          <p className="text-gray-500 font-medium text-sm">Aún no tienes amigos</p>
          <p className="text-xs text-gray-400 text-center">
            Añade a alguien por su email para dividir reservas más fácilmente.
          </p>
        </div>
      ) : (
        <>
          {/* Sección auto-cobro activado */}
          {conAutoCobro.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Auto-cobro activado
              </p>
              {conAutoCobro.map((a) => (
                <AmigoRow
                  key={a.id}
                  amigo={a}
                  isLoading={loadingId === a.id}
                  onToggle={() => handleToggle(a.id, false)}
                  onEliminar={() => handleEliminar(a.id)}
                />
              ))}
            </div>
          )}

          {/* Separador si hay amigos en ambas secciones */}
          {conAutoCobro.length > 0 && sinAutoCobro.length > 0 && (
            <hr className="border-gray-200" />
          )}

          {/* Sección amigos sin auto-cobro */}
          {sinAutoCobro.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Amigos
              </p>
              {sinAutoCobro.map((a) => (
                <AmigoRow
                  key={a.id}
                  amigo={a}
                  isLoading={loadingId === a.id}
                  onToggle={() => handleToggle(a.id, true)}
                  onEliminar={() => handleEliminar(a.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

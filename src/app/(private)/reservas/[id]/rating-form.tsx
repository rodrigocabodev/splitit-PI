"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { valorarServicio } from "./actions";

export default function RatingForm({
  bookingId,
  serviceId,
  initialScore,
  initialComment,
}: {
  bookingId: number;
  serviceId: number;
  initialScore: number | null;
  initialComment: string | null;
}) {
  const [score, setScore] = useState<number>(initialScore ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(!initialScore);
  const [error, setError] = useState<string | null>(null);

  async function guardar(nuevoScore: number, nuevoComment: string) {
    setLoading(true);
    setError(null);
    const res = await valorarServicio(
      bookingId,
      serviceId,
      nuevoScore,
      nuevoComment.trim() || null,
    );
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return false;
    }
    return true;
  }

  async function handleStarClick(s: number) {
    if (loading) return;
    setScore(s);
    await guardar(s, comment);
  }

  async function handleGuardarTodo() {
    if (loading || score === 0) return;
    const ok = await guardar(score, comment);
    if (ok) setEditando(false);
  }

  const active = hover || score;

  // Vista "ya valorada": resumen compacto + botón editar
  if (!editando && score > 0) {
    return (
      <div className="border rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Tu valoración</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditando(true)}
            className="h-7 px-2 text-xs"
          >
            <Pencil className="size-3" /> Editar
          </Button>
        </div>
        <div className="flex items-center gap-1 text-2xl leading-none">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={score >= s ? "text-yellow-400" : "text-gray-200"}>
              ★
            </span>
          ))}
          <span className="text-sm text-muted-foreground ml-2">{score}/5</span>
        </div>
        {comment && (
          <p className="text-sm text-muted-foreground italic">&ldquo;{comment}&rdquo;</p>
        )}
      </div>
    );
  }

  // Vista "editar": formulario completo
  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">Valorar el servicio</p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => handleStarClick(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            disabled={loading}
            className="text-3xl leading-none transition-transform hover:scale-110 disabled:opacity-50 focus:outline-none"
            aria-label={`${s} estrella${s > 1 ? "s" : ""}`}
          >
            <span className={active >= s ? "text-yellow-400" : "text-gray-200"}>★</span>
          </button>
        ))}
        {score > 0 && (
          <span className="text-sm text-gray-500 ml-2">{score}/5</span>
        )}
      </div>

      {score > 0 && (
        <div className="flex flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuenta tu experiencia (opcional)..."
            maxLength={500}
            rows={3}
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{comment.length}/500</span>
            <Button size="sm" onClick={handleGuardarTodo} disabled={loading}>
              {loading ? "Guardando..." : "Guardar valoración"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toggleServicioActivo, actualizarServicio, crearServicio, subirImagenServicio } from "./actions";
import type { Service } from "@/types";

async function handleFileSelect(
  file: File,
  onUploaded: (url: string) => void,
  onError: (msg: string) => void,
  setUploading: (v: boolean) => void,
) {
  setUploading(true);
  const fd = new FormData();
  fd.append("file", file);
  const r = await subirImagenServicio(fd);
  setUploading(false);
  if (r.error) onError(r.error);
  else if (r.url) onUploaded(r.url);
}

// ── Fila editable de un servicio ──────────────────────────────────────────
function ServicioRow({ servicio, onToggle, onUpdate }: {
  servicio: Service;
  onToggle: (id: number, actual: boolean) => void;
  onUpdate: (id: number, datos: any) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [title, setTitle] = useState(servicio.title);
  const [category, setCategory] = useState(servicio.category);
  const [price, setPrice] = useState(String(servicio.price_per_hour));
  const [description, setDescription] = useState(servicio.description ?? "");
  const [opensAt, setOpensAt] = useState(servicio.opens_at?.slice(0, 5) ?? "09:00");
  const [closesAt, setClosesAt] = useState(servicio.closes_at?.slice(0, 5) ?? "21:00");
  const [imageUrl, setImageUrl] = useState<string | null>(servicio.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
    setLoading(true);
    setError(null);
    const datos = {
      title,
      category,
      price_per_hour: Number(price),
      description,
      opens_at: opensAt,
      closes_at: closesAt,
      image_url: imageUrl,
    };
    const result = await actualizarServicio(servicio.id, datos);
    if (result?.error) {
      setError(result.error);
    } else {
      onUpdate(servicio.id, datos);
      setEditando(false);
    }
    setLoading(false);
  }

  if (editando) {
    return (
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Nombre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Categoría</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Precio/hora (€)</Label>
            <Input type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Apertura</Label>
            <Input type="time" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Cierre</Label>
            <Input type="time" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Imagen</Label>
          <div className="flex items-center gap-3">
            {imageUrl && (
              <img src={imageUrl} alt="" className="size-16 rounded object-cover border" />
            )}
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f, setImageUrl, setError, setUploading);
              }}
            />
            {imageUrl && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setImageUrl(null)}>
                Quitar
              </Button>
            )}
          </div>
          {uploading && <p className="text-xs text-gray-400">Subiendo imagen...</p>}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleGuardar} disabled={loading || uploading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{servicio.title}</p>
          <Badge variant="secondary">{servicio.category}</Badge>
          {!servicio.is_active && (
            <Badge variant="destructive">Inactivo</Badge>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {servicio.price_per_hour} €/h · ⭐ {servicio.rating} · {servicio.opens_at?.slice(0, 5)}–{servicio.closes_at?.slice(0, 5)}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
          Editar
        </Button>
        <Button
          size="sm"
          variant={servicio.is_active ? "outline" : "default"}
          onClick={() => onToggle(servicio.id, servicio.is_active)}
        >
          {servicio.is_active ? "Desactivar" : "Activar"}
        </Button>
      </div>
    </div>
  );
}

// ── Formulario nuevo servicio ─────────────────────────────────────────────
function NuevoServicioForm() {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (imageUrl) formData.set("image_url", imageUrl);
    const result = await crearServicio(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Recargar la lista refrescando la página
      window.location.reload();
    }
  }

  if (!abierto) {
    return (
      <Button onClick={() => setAbierto(true)} size="sm">
        + Nuevo servicio
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-sm">Nuevo servicio</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="title" className="text-xs">Nombre *</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="category" className="text-xs">Categoría *</Label>
          <Input id="category" name="category" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="price_per_hour" className="text-xs">Precio/hora (€) *</Label>
          <Input id="price_per_hour" name="price_per_hour" type="number" min="0" step="0.5" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="description" className="text-xs">Descripción</Label>
          <Input id="description" name="description" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="opens_at" className="text-xs">Apertura</Label>
          <Input id="opens_at" name="opens_at" type="time" defaultValue="09:00" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="closes_at" className="text-xs">Cierre</Label>
          <Input id="closes_at" name="closes_at" type="time" defaultValue="21:00" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Imagen (opcional)</Label>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt="" className="size-16 rounded object-cover border" />
          )}
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f, setImageUrl, setError, setUploading);
            }}
          />
          {imageUrl && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setImageUrl(null)}>
              Quitar
            </Button>
          )}
        </div>
        {uploading && <p className="text-xs text-gray-400">Subiendo imagen...</p>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || uploading}>
          {loading ? "Creando..." : "Crear servicio"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function AdminServiciosClient({ servicios: inicial }: { servicios: Service[] }) {
  const [lista, setLista] = useState(inicial);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");

  async function handleToggle(id: number, actual: boolean) {
    // Actualización optimista
    setLista((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !actual } : s));
    const result = await toggleServicioActivo(id, !actual);
    if (result?.error) {
      // Revertir si falla
      setLista((prev) => prev.map((s) => s.id === id ? { ...s, is_active: actual } : s));
    }
  }

  function handleUpdate(id: number, datos: Partial<Service>) {
    setLista(lista.map((s) => s.id === id ? { ...s, ...datos } : s));
  }

  const q = busqueda.trim().toLowerCase();
  const filtrados = lista.filter((s) => {
    if (filtroEstado === "activos" && !s.is_active) return false;
    if (filtroEstado === "inactivos" && s.is_active) return false;
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nombre o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        <NuevoServicioForm />
      </div>

      <div className="flex gap-2 items-center">
        {(["todos", "activos", "inactivos"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtroEstado === f ? "default" : "outline"}
            onClick={() => setFiltroEstado(f)}
          >
            {f === "todos" ? "Todos" : f === "activos" ? "Activos" : "Inactivos"}
          </Button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">
          {filtrados.length} de {lista.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtrados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin resultados.</p>
        ) : (
          filtrados.map((s) => (
            <ServicioRow
              key={s.id}
              servicio={s}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}

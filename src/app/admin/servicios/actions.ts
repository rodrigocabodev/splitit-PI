"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function toggleServicioActivo(id: number, valor: boolean) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ is_active: valor })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/servicios");
  revalidatePath("/catalogo");
}

export async function actualizarServicio(
  id: number,
  datos: {
    title: string;
    price_per_hour: number;
    category: string;
    description: string;
    opens_at: string;
    closes_at: string;
    image_url?: string | null;
  }
) {
  const err = await requireAdmin();
  if (err) return { error: err };

  if (datos.opens_at >= datos.closes_at) {
    return { error: "La hora de apertura debe ser anterior a la de cierre." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update(datos)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/servicios");
  revalidatePath("/catalogo");
}

export async function crearServicio(formData: FormData) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();

  const title = (formData.get("title") as string).trim();
  const category = (formData.get("category") as string).trim();
  const price_per_hour = Number(formData.get("price_per_hour"));
  const description = (formData.get("description") as string).trim();
  const opens_at = ((formData.get("opens_at") as string) || "09:00").trim();
  const closes_at = ((formData.get("closes_at") as string) || "21:00").trim();
  const image_url = ((formData.get("image_url") as string) || "").trim() || null;

  if (!title || !category || !price_per_hour) return { error: "Faltan campos obligatorios." };
  if (opens_at >= closes_at) {
    return { error: "La hora de apertura debe ser anterior a la de cierre." };
  }

  const { error: insertError } = await supabase.from("services").insert({
    title,
    category,
    price_per_hour,
    description: description || null,
    opens_at,
    closes_at,
    image_url,
    is_active: true,
    rating: 0,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/servicios");
  revalidatePath("/catalogo");
}

export async function subirImagenServicio(formData: FormData): Promise<{ url?: string; error?: string }> {
  const err = await requireAdmin();
  if (err) return { error: err };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No se ha seleccionado ningún archivo." };
  if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen no puede superar 5 MB." };

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `servicio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("services")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) return { error: upErr.message };

  const { data } = supabase.storage.from("services").getPublicUrl(path);
  return { url: data.publicUrl };
}

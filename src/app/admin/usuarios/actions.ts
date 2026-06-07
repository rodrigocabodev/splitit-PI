"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function toggleUsuarioAdmin(userId: string) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_toggle_user_admin", {
    p_user_id: userId,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("propio rol")) return { error: "No puedes cambiar tu propio rol de administrador." };
    if (msg.includes("no encontrado")) return { error: "Usuario no encontrado." };
    if (msg.includes("Acceso denegado")) return { error: "No autorizado." };
    return { error: msg || "No se pudo actualizar el usuario." };
  }

  revalidatePath("/admin/usuarios");
  return { is_admin: data as boolean };
}

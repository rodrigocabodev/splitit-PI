"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function actualizarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: formData.get("full_name") as string })
    .eq("id", user.id);

  if (error) return { error: error.message };
}

export async function cambiarContrasena(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const password = ((formData.get("password") as string) ?? "").trim();
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password.length > 72) {
    return { error: "La contraseña es demasiado larga (máx. 72 caracteres)." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
}

// Añade fondos a la cartera. La RPC actualiza saldo y registra el movimiento atómicamente.
export async function agregarFondos(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const importe = Number(formData.get("importe"));
  if (!Number.isFinite(importe) || importe <= 0) return { error: "Importe no válido." };
  if (importe > 1000) return { error: "Máximo 1000 € por recarga." };
  const importeRedondeado = Math.round(importe * 100) / 100;

  const { error } = await supabase.rpc("wallet_deposit", { p_amount: importeRedondeado });
  if (error) return { error: error.message };

  revalidatePath("/perfil");
}

// ── Sistema de amigos ──────────────────────────────────────────────────────

// Envía una solicitud de amistad buscando al usuario por email
export async function enviarSolicitud(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: contactProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (!contactProfile) return { error: "No existe ningún usuario con ese email." };
  if (contactProfile.id === user.id) return { error: "No puedes añadirte a ti mismo." };

  // Comprobar que no existe ya una relación en ninguna dirección
  const { data: yaExiste } = await supabase
    .from("trusted_contacts")
    .select("id")
    .or(
      `and(user_id.eq.${user.id},contact_id.eq.${contactProfile.id}),and(user_id.eq.${contactProfile.id},contact_id.eq.${user.id})`
    )
    .maybeSingle();

  if (yaExiste) return { error: "Ya existe una solicitud o amistad con ese usuario." };

  const { error } = await supabase
    .from("trusted_contacts")
    .insert({ user_id: user.id, contact_id: contactProfile.id, status: "pending" });

  if (error) return { error: error.message };
  revalidatePath("/perfil");
}

// Acepta una solicitud recibida (actualiza status a 'accepted').
// Solo el destinatario (contact_id) puede aceptar.
export async function aceptarSolicitud(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error, count } = await supabase
    .from("trusted_contacts")
    .update({ status: "accepted" }, { count: "exact" })
    .eq("id", id)
    .eq("contact_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Solicitud no encontrada o no autorizado." };
  revalidatePath("/perfil");
}

// Rechaza (elimina) una solicitud recibida.
// Solo el destinatario (contact_id) puede rechazarla.
export async function rechazarSolicitud(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error, count } = await supabase
    .from("trusted_contacts")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("contact_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Solicitud no encontrada o no autorizado." };
  revalidatePath("/perfil");
}

// Activa o desactiva el auto-cobro de un amigo.
// Cualquiera de los dos lados de la relación puede modificarlo.
export async function toggleAutoCobro(id: number, valor: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error, count } = await supabase
    .from("trusted_contacts")
    .update({ auto_pay_enabled: valor }, { count: "exact" })
    .eq("id", id)
    .or(`user_id.eq.${user.id},contact_id.eq.${user.id}`)
    .eq("status", "accepted");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Amistad no encontrada o no autorizado." };
}

// Elimina una amistad. Cualquiera de los dos lados puede hacerlo.
export async function eliminarAmigo(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error, count } = await supabase
    .from("trusted_contacts")
    .delete({ count: "exact" })
    .eq("id", id)
    .or(`user_id.eq.${user.id},contact_id.eq.${user.id}`);

  if (error) return { error: error.message };
  if (count === 0) return { error: "Amistad no encontrada o no autorizado." };
  revalidatePath("/perfil");
}

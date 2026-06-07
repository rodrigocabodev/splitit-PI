"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

// Cancela una reserva y reembolsa automáticamente a los participantes que pagaron
export async function cancelarReserva(id: number) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();

  const { error } = await supabase.rpc("cancelar_y_reembolsar", {
    p_booking_id: id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/reservas");
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
}

// Marca una reserva como finalizada (el evento ya ocurrió).
// Solo se puede finalizar una reserva 'confirmed' — no se puede revivir una cancelada.
export async function finalizarReserva(id: number) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();

  const { error, count } = await supabase
    .from("bookings")
    .update({ status: "finished" }, { count: "exact" })
    .eq("id", id)
    .eq("status", "confirmed");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Solo se pueden finalizar reservas confirmadas." };

  revalidatePath("/admin/reservas");
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
}

// Elimina una reserva por completo. Solo permitido si está cancelada,
// para evitar borrar reservas con pagos sin reembolsar.
export async function eliminarReserva(id: number) {
  const err = await requireAdmin();
  if (err) return { error: err };

  const supabase = await createClient();

  const { error, count } = await supabase
    .from("bookings")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("status", "cancelled");

  if (error) return { error: error.message };
  if (count === 0) {
    return { error: "Solo se pueden eliminar reservas canceladas. Cancela primero para reembolsar." };
  }

  revalidatePath("/admin/reservas");
}

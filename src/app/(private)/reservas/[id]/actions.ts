"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Registra el pago de un participante: la RPC valida autorización, estado de la
// reserva, cobra la cartera (si procede) y actualiza el participante en una
// única transacción. Así evitamos race conditions de doble click.
export async function pagarParticipante(
  participantId: number,
  bookingId: number,
  method: "wallet" | "card"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("pagar_participante_atomic", {
    p_participant_id: participantId,
    p_with_wallet: method === "wallet",
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("Saldo insuficiente")) return { error: "Saldo insuficiente en la cartera." };
    if (msg.includes("No autorizado")) return { error: "No autorizado." };
    if (msg.includes("ya completado")) return { error: "Este pago ya está completado." };
    if (msg.includes("no activa") || msg.includes("no encontrado")) {
      return { error: "Esta reserva ya no admite pagos." };
    }
    return { error: msg || "No se pudo completar el pago." };
  }

  revalidatePath(`/reservas/${bookingId}`);
  revalidatePath("/reservas");
  revalidatePath("/perfil");
}

// Guarda o actualiza la valoración del usuario para un servicio (1-5 estrellas + comentario).
// El trigger en la BD recalcula automáticamente el promedio en services.rating.
export async function valorarServicio(
  bookingId: number,
  serviceId: number,
  score: number,
  comment: string | null = null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Validar puntuación
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { error: "Puntuación inválida." };
  }

  // Verificar que el booking existe y que el service_id coincide con el de la reserva
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, service_id, organizer_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking) return { error: "Reserva no encontrada." };
  if (booking.service_id !== serviceId) return { error: "Servicio no coincide con la reserva." };
  if (booking.status !== "finished") {
    return { error: "Solo puedes valorar reservas finalizadas." };
  }

  // El usuario debe ser el organizador o un participante que haya pagado
  let autorizado = booking.organizer_id === user.id;
  if (!autorizado) {
    const { data: participacion } = await supabase
      .from("participants")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("user_id", user.id)
      .eq("payment_status", "paid")
      .maybeSingle();
    autorizado = !!participacion;
  }
  if (!autorizado) return { error: "No autorizado para valorar esta reserva." };

  const comentarioLimpio = comment?.trim() ? comment.trim().slice(0, 500) : null;

  const { error } = await supabase
    .from("ratings")
    .upsert(
      { booking_id: bookingId, user_id: user.id, service_id: serviceId, score, comment: comentarioLimpio },
      { onConflict: "booking_id,user_id" }
    );

  if (error) return { error: error.message };

  revalidatePath(`/reservas/${bookingId}`);
  revalidatePath(`/servicios/${serviceId}`);
  revalidatePath("/catalogo");
}

// Cancela una reserva y reembolsa a todos los que pagaron.
// Solo el organizador puede hacerlo. Los reembolsos van a la cartera.
export async function cancelarReserva(bookingId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar que el usuario es el organizador y que la reserva sigue activa
  const { data: booking } = await supabase
    .from("bookings")
    .select("organizer_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking) return { error: "Reserva no encontrada." };
  if (booking.organizer_id !== user.id) return { error: "No autorizado." };
  if (booking.status === "cancelled") return { error: "La reserva ya está cancelada." };
  if (booking.status === "finished") return { error: "No puedes cancelar una reserva finalizada." };

  const { error } = await supabase.rpc("cancelar_y_reembolsar", {
    p_booking_id: bookingId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/reservas/${bookingId}`);
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
}

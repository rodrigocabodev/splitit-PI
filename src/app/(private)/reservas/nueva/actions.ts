"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DatosReserva = {
  service_id: number;
  start_time: string;
  end_time: string;
  participant_emails: string[];
  payment_method: "wallet" | "card";
};

// Crea la reserva y divide el coste entre todos los participantes.
// Si un participante tiene auto-cobro activo, se le carga automáticamente.
export async function crearReserva(datos: DatosReserva) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Validar fechas
  const start = new Date(datos.start_time);
  const end = new Date(datos.end_time);
  const ahora = new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Fechas inválidas." };
  }
  if (start < ahora) {
    return { error: "No puedes reservar una fecha que ya ha pasado." };
  }
  if (end <= start) {
    return { error: "La hora de fin debe ser posterior a la de inicio." };
  }
  const horasReserva = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (horasReserva > 8) {
    return { error: "La duración máxima por reserva es de 8 horas." };
  }

  // Recalcular el precio en el servidor a partir del servicio (no confiar en el cliente)
  const { data: servicio } = await supabase
    .from("services")
    .select("price_per_hour, is_active")
    .eq("id", datos.service_id)
    .single();

  if (!servicio || !servicio.is_active) {
    return { error: "Servicio no disponible." };
  }

  const totalPrice = Number((Number(servicio.price_per_hour) * horasReserva).toFixed(2));

  // Deduplicar emails: minúsculas, sin espacios, sin el organizador, sin repetidos
  const emailOrganizador = (user.email ?? "").toLowerCase().trim();
  const emailsLimpios = Array.from(
    new Set(
      datos.participant_emails
        .map((e) => e.toLowerCase().trim())
        .filter((e) => e.length > 0 && e !== emailOrganizador)
    )
  );

  const numPersonas = emailsLimpios.length + 1;
  const importePorPersona = Number((totalPrice / numPersonas).toFixed(2));

  // 1. Crear la reserva, cobrar al organizador y registrarlo como participante,
  //    todo en una única transacción. Si algo falla, se revierte todo.
  //    La EXCLUDE constraint sigue protegiendo los solapamientos.
  const { data: bookingId, error } = await supabase.rpc("crear_reserva_con_organizador", {
    p_service_id: datos.service_id,
    p_start_time: datos.start_time,
    p_end_time: datos.end_time,
    p_total_price: totalPrice,
    p_amount_owed: importePorPersona,
    p_with_wallet: datos.payment_method === "wallet",
  });

  if (error || !bookingId) {
    const codigo = (error as { code?: string } | null)?.code;
    if (codigo === "23P01") {
      return { error: "Este servicio ya está reservado en ese horario. Elige otra hora." };
    }
    const msg = error?.message ?? "";
    if (msg.includes("Saldo insuficiente")) {
      return { error: "Saldo insuficiente en la cartera." };
    }
    if (msg.includes("Fuera del horario")) {
      return { error: "La reserva se sale del horario del servicio." };
    }
    if (msg.includes("medianoche")) {
      return { error: "La reserva no puede cruzar la medianoche." };
    }
    if (msg.includes("Servicio no encontrado")) {
      return { error: "Servicio no disponible." };
    }
    return { error: msg || "No se pudo crear la reserva." };
  }

  // 2. Insertar al resto de participantes con la RPC atómica:
  //    el cobro y el insert están en la misma transacción, así que
  //    nunca queda un cobro huérfano si el insert falla.
  //    Recolectamos los que fallen para avisar al organizador.
  const fallidos: string[] = [];
  for (const email of emailsLimpios) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    const { error: partErr } = await supabase.rpc("crear_participante_con_auto_cobro", {
      p_booking_id: bookingId,
      p_user_id: perfil?.id ?? null,
      p_guest_email: perfil ? null : email,
      p_amount: importePorPersona,
    });

    if (partErr) {
      console.error(`Error añadiendo participante ${email}:`, partErr);
      fallidos.push(email);
    }
  }

  // Si algún participante falló, lo pasamos como query param para que la
  // página de detalle muestre un aviso al organizador.
  const destino = fallidos.length > 0
    ? `/reservas/${bookingId}?fallidos=${encodeURIComponent(fallidos.join(","))}`
    : `/reservas/${bookingId}`;
  redirect(destino);
}

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/status-badge";
import { Money } from "@/components/ui/money";
import { initialsFor, formatHora, formatFecha } from "@/lib/format";
import { ArrowLeft, AlertTriangle, Calendar, Clock, User, Users, Receipt, Crown } from "lucide-react";
import PagarForm from "./pagar-form";
import CancelarButton from "./cancelar-button";
import RatingForm from "./rating-form";
import AutoCancelCountdown from "./auto-cancel-countdown";

export default async function DetalleReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fallidos?: string }>;
}) {
  const { id } = await params;
  const { fallidos } = await searchParams;
  const emailsFallidos = fallidos
    ? fallidos.split(",").map((e) => e.trim()).filter(Boolean).slice(0, 20)
    : [];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.rpc("auto_cancelar_reservas_impagas");

  const [{ data: booking }, { data: myProfile }, { data: myRating }] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        *,
        services(title, category, price_per_hour),
        profiles!bookings_organizer_id_fkey(full_name, email),
        participants(
          *,
          profiles!participants_user_id_fkey(full_name, email)
        )
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single(),
    supabase
      .from("ratings")
      .select("score, comment")
      .eq("booking_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!booking) notFound();

  const esOrganizador = booking.organizer_id === user.id;
  const esParticipante = (booking.participants ?? []).some(
    (p: { user_id: string | null }) => p.user_id === user.id
  );
  if (!esOrganizador && !esParticipante) notFound();

  if (esOrganizador && booking.status === "confirmed" && new Date(booking.end_time) < new Date()) {
    await supabase.rpc("auto_finalizar_reservas_pasadas");
    booking.status = "finished";
  }

  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const duracionHoras = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const isOrganizer = booking.organizer_id === user?.id;
  const walletBalance = Number(myProfile?.wallet_balance ?? 0);
  const participants: any[] = booking.participants ?? [];

  const myParticipant = participants.find((p) => p.user_id === user?.id);
  const pagados = participants.filter((p) => p.payment_status === "paid").length;
  const total = participants.length;
  const todosPagado = total > 0 && pagados === total;
  const precioPorPersona = total > 0 ? Number((booking.total_price / total).toFixed(2)) : booking.total_price;
  const progresoPago = total > 0 ? Math.round((pagados / total) * 100) : 0;

  const organizadorNombre = isOrganizer
    ? "Tú"
    : ((booking.profiles as any)?.full_name ?? (booking.profiles as any)?.email ?? "—");

  // Deadline de auto-cancelación: solo aplica si está confirmada, dentro de la
  // ventana de 2h previas al inicio y queda algún impago. Coincide con la regla
  // del cron: max(created_at + 5min, start_time - 2h).
  const ahora = Date.now();
  const enVentana2h = start.getTime() - ahora <= 2 * 60 * 60 * 1000;
  const hayImpagos = participants.some((p) => p.payment_status !== "paid");
  const mostrarCountdown =
    booking.status === "confirmed" && enVentana2h && hayImpagos;
  const deadlineMs = mostrarCountdown
    ? Math.max(
        new Date(booking.created_at).getTime() + 5 * 60 * 1000,
        start.getTime() - 2 * 60 * 60 * 1000,
      )
    : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Volver */}
      <Link href="/reservas" className="text-sm text-muted-foreground hover:text-foreground transition w-fit inline-flex items-center gap-1.5">
        <ArrowLeft className="size-3.5" /> Mis reservas
      </Link>

      {/* Aviso de auto-cancelación inminente */}
      {deadlineMs !== null && (
        <AutoCancelCountdown deadline={new Date(deadlineMs).toISOString()} />
      )}

      {/* Aviso si fallaron invitaciones */}
      {isOrganizer && emailsFallidos.length > 0 && (
        <div className="border border-warning/40 bg-warning/10 text-warning-foreground text-sm rounded-xl px-4 py-3 flex gap-3">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold mb-1">
              No se pudieron añadir {emailsFallidos.length} participante{emailsFallidos.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs mb-2 opacity-90">
              La reserva se ha creado, pero no pudimos invitar a:
            </p>
            <ul className="text-xs list-disc list-inside">
              {emailsFallidos.map((e) => (
                <li key={e} className="break-all">{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b">
        <div className="min-w-0">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">{booking.services?.category}</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{booking.services?.title}</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge kind="booking" status={booking.status} />
        </div>
      </div>

      {/* Progreso de pago */}
      {total > 0 && (booking.status === "pending" || booking.status === "confirmed") && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium">Pagos recibidos</span>
            <span className={todosPagado ? "text-success font-semibold" : "tabular-nums"}>
              {pagados} / {total} {todosPagado && "✓"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${todosPagado ? "bg-success" : "bg-primary"}`}
              style={{ width: `${progresoPago}%` }}
            />
          </div>
        </div>
      )}

      {/* Info de la reserva */}
      <div className="border rounded-xl divide-y text-sm bg-card">
        <InfoRow icon={User} label="Organizador" value={organizadorNombre} />
        <InfoRow
          icon={Calendar}
          label="Fecha"
          value={formatFecha(start, { weekday: "long", day: "numeric", month: "long" })}
        />
        <InfoRow
          icon={Clock}
          label="Hora"
          value={
            <>
              {formatHora(start)}
              {" — "}
              {formatHora(end)}
              <span className="text-muted-foreground ml-1">({duracionHoras}h)</span>
            </>
          }
        />
        <InfoRow
          icon={Receipt}
          label="Total reserva"
          value={<Money value={booking.total_price} />}
        />
        {total > 1 && (
          <InfoRow
            icon={Users}
            label={`Por persona (${total})`}
            value={<Money value={precioPorPersona} tone="positive" />}
          />
        )}
      </div>

      {/* Formulario de pago */}
      {myParticipant && myParticipant.payment_status === "pending" && (
        <PagarForm
          participantId={myParticipant.id}
          bookingId={booking.id}
          amount={Number(myParticipant.amount_owed)}
          walletBalance={walletBalance}
        />
      )}

      {/* Lista de participantes */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Participantes{total > 0 ? ` (${total})` : ""}
        </h2>
        <div className="flex flex-col gap-2">
          {participants.map((p: any) => {
            const esYo = p.user_id === user?.id;
            const perfil = p.profiles as { full_name: string | null; email: string } | null;
            const nombre = esYo
              ? "Tú"
              : perfil?.full_name ?? perfil?.email ?? p.guest_email ?? "Invitado";
            const email = esYo ? null : perfil?.email ?? p.guest_email ?? null;
            const esOrganizadorRow = p.user_id === booking.organizer_id;
            const initials = initialsFor(nombre, email);

            return (
              <div
                key={p.id}
                className="flex items-center justify-between border rounded-xl px-4 py-3 gap-3 bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`size-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    esYo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{nombre}</p>
                      {esOrganizadorRow && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          <Crown className="size-2.5" />
                          Organizador
                        </span>
                      )}
                    </div>
                    {email && (
                      <p className="text-xs text-muted-foreground truncate">{email}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      <Money value={p.amount_owed} tone="muted" className="text-xs font-normal" />
                    </p>
                  </div>
                </div>
                <StatusBadge
                  kind="payment"
                  status={
                    p.payment_status === "paid"
                      ? booking.status === "cancelled" ? "refunded" : "paid"
                      : booking.status === "cancelled" ? "unpaid" : "pending"
                  }
                />
              </div>
            );
          })}

          {total === 0 && (
            <p className="text-sm text-muted-foreground italic">Sin participantes registrados.</p>
          )}
        </div>
      </div>

      {/* Valorar */}
      {booking.status === "finished" && (isOrganizer || myParticipant?.payment_status === "paid") && (
        <RatingForm
          bookingId={booking.id}
          serviceId={booking.service_id}
          initialScore={myRating?.score ?? null}
          initialComment={myRating?.comment ?? null}
        />
      )}

      {/* Cancelar */}
      {isOrganizer && booking.status !== "cancelled" && booking.status !== "finished" && (
        <CancelarButton
          bookingId={booking.id}
          pagados={pagados}
          totalReembolso={participants
            .filter((p) => p.payment_status === "paid")
            .reduce((sum, p) => sum + Number(p.amount_owed), 0)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 gap-3">
      <span className="text-muted-foreground inline-flex items-center gap-2">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}

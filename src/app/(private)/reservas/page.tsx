import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { formatHora, formatFecha } from "@/lib/format";
import { CreditCard, CalendarX, Plus, ChevronRight, Star, AlertTriangle } from "lucide-react";

const VENTANA_RIESGO_MS = 2 * 60 * 60 * 1000;

const FILTROS = ["Todas", "confirmed", "finished", "cancelled"];

const FILTRO_LABELS: Record<string, string> = {
  Todas: "Todas",
  confirmed: "Confirmadas",
  finished: "Finalizadas",
  cancelled: "Canceladas",
};

export default async function MisReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.rpc("auto_cancelar_reservas_impagas");
  await supabase.rpc("auto_finalizar_reservas_pasadas");

  let query = supabase
    .from("bookings")
    .select("*, services(title, category), participants(payment_status)")
    .eq("organizer_id", user.id);

  if (estado && estado !== "Todas") {
    query = query.eq("status", estado);
  }

  const [
    { data: reservas },
    { data: todasParticipaciones },
    { data: misValoraciones },
  ] = await Promise.all([
    query.order("start_time", { ascending: false }),
    supabase
      .from("participants")
      .select("id, amount_owed, payment_status, booking_id, bookings!inner(id, start_time, end_time, status, organizer_id, services(title))")
      .eq("user_id", user.id),
    supabase.from("ratings").select("booking_id").eq("user_id", user.id),
  ]);

  const valoradas = new Set<number>((misValoraciones ?? []).map((r: any) => r.booking_id));

  const pendientes = (todasParticipaciones ?? []).filter(
    (p: any) => p.payment_status === "pending" && p.bookings?.status === "confirmed"
  );
  let participadasPagadas = (todasParticipaciones ?? []).filter(
    (p: any) => p.payment_status === "paid" && p.bookings?.organizer_id !== user.id
  );
  if (estado && estado !== "Todas") {
    participadasPagadas = participadasPagadas.filter(
      (p: any) => p.bookings?.status === estado
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mis reservas</h1>
        <Link href="/catalogo" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-3.5" /> Nueva
        </Link>
      </div>

      {/* ── Pagos pendientes ── */}
      {pendientes.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-warning-foreground" />
            <p className="text-sm font-semibold text-warning-foreground">
              {pendientes.length} pago{pendientes.length > 1 ? "s" : ""} pendiente{pendientes.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendientes.map((p: any) => {
              const booking = p.bookings;
              const fecha = new Date(booking.start_time);
              return (
                <Link
                  key={p.id}
                  href={`/reservas/${booking.id}`}
                  className="group border border-warning/30 bg-warning/5 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-warning/10 hover:border-warning/50 transition-all"
                >
                  <div>
                    <p className="font-medium text-sm">{booking.services?.title}</p>
                    <p className="text-xs text-muted-foreground">{formatFecha(fecha)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Money value={p.amount_owed} tone="warning" />
                    <StatusBadge kind="payment" status="pending" />
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Filtros ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map((f) => {
          const isActive = f === (estado ?? "Todas");
          return (
            <Link
              key={f}
              href={f === "Todas" ? "/reservas" : `/reservas?estado=${f}`}
              className={buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" })}
            >
              {FILTRO_LABELS[f]}
            </Link>
          );
        })}
      </div>

      {/* ── Reservas que organicé ── */}
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reservas que organicé</p>

        {!reservas || reservas.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title={
              estado && estado !== "Todas"
                ? "No hay reservas con este estado"
                : "Aún no has organizado ninguna reserva"
            }
            description="Cuando reserves un servicio aparecerá aquí."
            action={
              <Link href="/catalogo" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Explorar catálogo
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {reservas.map((r: any, i: number) => {
              const fecha = new Date(r.start_time);
              const fin = new Date(r.end_time);
              const pagados = (r.participants ?? []).filter((p: any) => p.payment_status === "paid").length;
              const total = (r.participants ?? []).length;
              const todosPagado = total > 0 && pagados === total;
              const enRiesgo =
                r.status === "confirmed" &&
                !todosPagado &&
                fecha.getTime() - Date.now() <= VENTANA_RIESGO_MS;
              return (
                <Link
                  key={r.id}
                  href={`/reservas/${r.id}`}
                  className="group border rounded-xl px-4 py-4 flex items-center justify-between hover:bg-muted/50 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">{r.services?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFecha(fecha)} ·{" "}
                      {formatHora(fecha)} —{" "}
                      {formatHora(fin)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge kind="booking" status={r.status} />
                    <span className={`text-xs tabular-nums ${todosPagado ? "text-success font-medium" : "text-muted-foreground"}`}>
                      {todosPagado ? "✓ Todo pagado" : `${pagados}/${total} pagado`}
                    </span>
                    {r.status === "finished" && !valoradas.has(r.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <Star size={11} strokeWidth={2.5} /> Sin valorar
                      </span>
                    )}
                    {enRiesgo && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-foreground bg-warning/15 border border-warning/40 rounded-full px-2 py-0.5">
                        <AlertTriangle size={11} strokeWidth={2.5} /> Se cancela pronto
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Reservas en las que participo ── */}
      {participadasPagadas.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reservas en las que participo</p>
          <div className="flex flex-col gap-2">
            {participadasPagadas.map((p: any) => {
              const booking = p.bookings;
              const fecha = new Date(booking.start_time);
              const fin = new Date(booking.end_time);
              return (
                <Link
                  key={p.id}
                  href={`/reservas/${booking.id}`}
                  className="group border rounded-xl px-4 py-4 flex items-center justify-between hover:bg-muted/50 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">{booking.services?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFecha(fecha)} ·{" "}
                      {formatHora(fecha)} —{" "}
                      {formatHora(fin)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge kind="booking" status={booking.status} />
                    {booking.status === "cancelled" ? (
                      <span className="text-xs text-info font-medium tabular-nums">
                        <Money value={p.amount_owed} tone="muted" className="text-xs" /> reembolsado
                      </span>
                    ) : (
                      <span className="text-xs text-success font-medium tabular-nums">
                        <Money value={p.amount_owed} tone="positive" className="text-xs" /> pagado
                      </span>
                    )}
                    {booking.status === "finished" && !valoradas.has(booking.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <Star size={11} strokeWidth={2.5} /> Sin valorar
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

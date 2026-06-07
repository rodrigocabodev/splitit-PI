import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Money } from "@/components/ui/money";
import { formatHora, formatFecha } from "@/lib/format";
import { CreditCard, Wallet, CalendarDays, Users, CalendarPlus, Plus, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const ahora = new Date().toISOString();

  const [
    { data: profile },
    { data: proximasReservas },
    { data: pendientes },
    { count: numAmigos },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, wallet_balance").eq("id", user.id).single(),
    supabase
      .from("bookings")
      .select("*, services(title)")
      .eq("organizer_id", user.id)
      .neq("status", "cancelled")
      .gte("start_time", ahora)
      .order("start_time", { ascending: true })
      .limit(4),
    supabase
      .from("participants")
      .select("id, amount_owed, booking_id, bookings!inner(id, start_time, status, services(title))")
      .eq("user_id", user.id)
      .eq("payment_status", "pending")
      .eq("bookings.status", "confirmed"),
    supabase
      .from("trusted_contacts")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${user.id},contact_id.eq.${user.id}`)
      .eq("status", "accepted"),
  ]);

  const nombre = profile?.full_name?.split(" ")[0] ?? "usuario";

  return (
    <div className="flex flex-col gap-8 max-w-3xl animate-in fade-in duration-500">

      {/* Saludo */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hola, {nombre} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Aquí tienes tu resumen</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Saldo"
          value={<Money value={profile?.wallet_balance} />}
          icon={Wallet}
          href="/perfil?tab=cartera"
          accent="primary"
        />
        <StatCard
          label="Próximas"
          value={proximasReservas?.length ?? 0}
          icon={CalendarDays}
          href="/reservas"
          accent="info"
        />
        <StatCard
          label="Amigos"
          value={numAmigos ?? 0}
          icon={Users}
          href="/perfil?tab=amigos"
          accent="success"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Pagos pendientes */}
      {pendientes && pendientes.length > 0 && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-warning-foreground" />
            <p className="text-sm font-semibold text-warning-foreground">
              {pendientes.length} pago{pendientes.length > 1 ? "s" : ""} pendiente{pendientes.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendientes.map((p: any) => (
              <Link
                key={p.id}
                href={`/reservas/${p.booking_id}`}
                className="group border border-warning/30 bg-warning/5 rounded-xl px-4 py-3 flex justify-between items-center hover:bg-warning/10 hover:border-warning/50 transition-all"
              >
                <div>
                  <p className="text-sm font-medium">{p.bookings?.services?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.bookings?.start_time ? formatFecha(p.bookings.start_time) : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Money value={p.amount_owed} tone="warning" />
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Próximas reservas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Próximas reservas</h2>
          <Link href="/catalogo" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-3.5" /> Nueva
          </Link>
        </div>

        {!proximasReservas || proximasReservas.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="No tienes reservas próximas"
            description="Explora el catálogo y reserva tu primer servicio en grupo."
            action={
              <Link href="/catalogo" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Explorar servicios
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {proximasReservas.map((r: any, i: number) => {
              const fecha = new Date(r.start_time);
              return (
                <Link
                  key={r.id}
                  href={`/reservas/${r.id}`}
                  className="group border rounded-xl px-4 py-3 flex items-center justify-between hover:bg-muted/50 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div>
                    <p className="text-sm font-medium">{r.services?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFecha(fecha, { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}
                      {formatHora(fecha)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge kind="booking" status={r.status} />
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
            <Link href="/reservas" className="text-xs text-muted-foreground hover:text-foreground text-center pt-1 transition">
              Ver todas las reservas →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

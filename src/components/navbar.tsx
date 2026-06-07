import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserPlus, CreditCard, Star, AlertTriangle } from "lucide-react";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let pendingSolicitudes = 0;
  let pendingPayments = 0;
  let pendingRatings = 0;
  let pendingRiesgo = 0;

  if (user) {
    const [
      { data: profile },
      { count: solicitudesCount },
      { count: paymentsCount },
      { data: ratingsCount },
      { data: riesgoCount },
    ] = await Promise.all([
      supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
      supabase
        .from("trusted_contacts")
        .select("id", { count: "exact", head: true })
        .eq("contact_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("payment_status", "pending"),
      supabase.rpc("contar_valoraciones_pendientes"),
      supabase.rpc("contar_reservas_en_riesgo"),
    ]);

    isAdmin = profile?.is_admin ?? false;
    pendingSolicitudes = solicitudesCount ?? 0;
    pendingPayments = paymentsCount ?? 0;
    pendingRatings = ratingsCount ?? 0;
    pendingRiesgo = riesgoCount ?? 0;
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="font-bold text-xl tracking-tight text-brand-gradient">
          SplitIt
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/catalogo" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition">
            Catálogo
          </Link>

          {user ? (
            <>
              <Link href="/reservas" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition">
                Mis reservas
              </Link>

              {isAdmin && (
                <Link href="/admin" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition border border-dashed border-border">
                  Admin
                </Link>
              )}

              {/* Notificaciones contextuales */}
              {(pendingSolicitudes > 0 || pendingPayments > 0 || pendingRatings > 0 || pendingRiesgo > 0) && (
                <div className="flex items-center gap-1 ml-1">
                  {/* Solicitud de amistad */}
                  {pendingSolicitudes > 0 && (
                    <Link
                      href="/perfil?tab=amigos"
                      title={`${pendingSolicitudes} solicitud${pendingSolicitudes > 1 ? "es" : ""} de amistad`}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition"
                    >
                      <UserPlus size={12} strokeWidth={2.5} />
                      <span>{pendingSolicitudes}</span>
                    </Link>
                  )}
                  {/* Pago pendiente */}
                  {pendingPayments > 0 && (
                    <Link
                      href="/reservas"
                      title={`${pendingPayments} pago${pendingPayments > 1 ? "s" : ""} pendiente${pendingPayments > 1 ? "s" : ""}`}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition"
                    >
                      <CreditCard size={12} strokeWidth={2.5} />
                      <span>{pendingPayments}</span>
                    </Link>
                  )}
                  {/* Reserva en riesgo de auto-cancelación */}
                  {pendingRiesgo > 0 && (
                    <Link
                      href="/reservas"
                      title={`${pendingRiesgo} reserva${pendingRiesgo > 1 ? "s" : ""} en riesgo de cancelación`}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-300 hover:bg-amber-100 transition"
                    >
                      <AlertTriangle size={12} strokeWidth={2.5} />
                      <span>{pendingRiesgo}</span>
                    </Link>
                  )}
                  {/* Valoración pendiente */}
                  {pendingRatings > 0 && (
                    <Link
                      href="/reservas?estado=finished"
                      title={`${pendingRatings} reserva${pendingRatings > 1 ? "s" : ""} sin valorar`}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <Star size={12} strokeWidth={2.5} />
                      <span>{pendingRatings}</span>
                    </Link>
                  )}
                </div>
              )}

              <Link href="/perfil" className={`${buttonVariants({ size: "sm" })} ml-1`}>
                Mi perfil
              </Link>

              <form action={logout} className="ml-1">
                <Button type="submit" variant="ghost" size="sm">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Entrar
              </Link>
              <Link href="/registro" className={buttonVariants({ size: "sm" })}>
                Registro
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

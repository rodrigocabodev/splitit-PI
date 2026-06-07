import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import DatosPersonalesForm from "./datos-personales-form";
import SeguridadForm from "./seguridad-form";
import AgregarFondosForm from "./agregar-fondos-form";
import AmigosTab from "./amigos-tab";
import PerfilTabs from "./perfil-tabs";
import { formatFecha } from "@/lib/format";

const TIPO_LABELS: Record<string, string> = {
  deposit: "Ingreso",
  payment: "Pago reserva",
  withdrawal: "Retirada",
  refund: "Reembolso",
};

const VALID_TABS = ["cartera", "amigos", "cuenta"] as const;
type Tab = (typeof VALID_TABS)[number];

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTab: Tab = VALID_TABS.includes(tab as Tab) ? (tab as Tab) : "cartera";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: transacciones },
    { data: amigosComoUser },
    { data: amigosComoContact },
    { data: solicitudesRecibidas },
    { count: pendingPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Amigos donde yo inicié la solicitud → el amigo es contact_id
    supabase
      .from("trusted_contacts")
      .select("id, auto_pay_enabled, profiles!trusted_contacts_contact_id_fkey(full_name, email)")
      .eq("user_id", user.id)
      .eq("status", "accepted"),
    // Amigos donde ellos me enviaron la solicitud → el amigo es user_id
    supabase
      .from("trusted_contacts")
      .select("id, auto_pay_enabled, profiles!trusted_contacts_user_id_fkey(full_name, email)")
      .eq("contact_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("trusted_contacts")
      .select("id, profiles!trusted_contacts_user_id_fkey(full_name, email)")
      .eq("contact_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("payment_status", "pending"),
  ]);

  const amigos = [...(amigosComoUser ?? []), ...(amigosComoContact ?? [])];
  const solicitudesCount = solicitudesRecibidas?.length ?? 0;
  const paymentsCount = pendingPayments ?? 0;

  // ── Contenido de cada tab (se pasa como ReactNode al wrapper cliente) ──

  const carteraContent = (
    <>
      <div className="border rounded-xl p-5">
        <p className="text-sm text-gray-500">Saldo disponible</p>
        <p className="text-3xl font-bold mt-1">
          {Number(profile?.wallet_balance ?? 0).toFixed(2)} €
        </p>
      </div>

      <AgregarFondosForm />

      {paymentsCount > 0 && (
        <Link
          href="/reservas"
          className="flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition"
        >
          <CreditCard size={15} className="shrink-0" />
          <span>
            <span className="font-semibold">
              {paymentsCount} pago{paymentsCount > 1 ? "s" : ""} pendiente{paymentsCount > 1 ? "s" : ""}
            </span>
            {" — "}ver en mis reservas
          </span>
        </Link>
      )}

      <h2 className="font-semibold">Historial de movimientos</h2>
      {!transacciones || transacciones.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 px-4 flex flex-col items-center gap-1">
          <p className="text-gray-500 font-medium text-sm">Sin movimientos todavía</p>
          <p className="text-xs text-gray-400 text-center">
            Tus ingresos, pagos y reembolsos aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transacciones.map((t: any) => (
            <div key={t.id} className="flex justify-between items-center border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{TIPO_LABELS[t.type]}</p>
                <p className="text-xs text-gray-400">
                  {formatFecha(t.created_at)}
                </p>
              </div>
              <span
                className={`font-bold text-sm ${
                  t.type === "deposit" || t.type === "refund" ? "text-green-600" : "text-red-500"
                }`}
              >
                {t.type === "deposit" || t.type === "refund" ? "+" : "-"}
                {t.amount} €
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const amigosContent = (
    <AmigosTab
      amigos={(amigos ?? []) as any}
      solicitudesRecibidas={(solicitudesRecibidas ?? []) as any}
    />
  );

  const cuentaContent = (
    <>
      <div>
        <p className="font-semibold mb-3">Datos personales</p>
        <DatosPersonalesForm
          fullName={profile?.full_name ?? ""}
          email={profile?.email ?? ""}
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <p className="font-semibold mb-3">Cambiar contraseña</p>
        <SeguridadForm />
      </div>
    </>
  );

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <PerfilTabs
        defaultTab={defaultTab}
        solicitudesCount={solicitudesCount}
        paymentsCount={paymentsCount}
        carteraContent={carteraContent}
        amigosContent={amigosContent}
        cuentaContent={cuentaContent}
      />
    </div>
  );
}

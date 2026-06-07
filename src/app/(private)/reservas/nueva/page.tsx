import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReservaWizard from "./reserva-wizard";

// El servidor obtiene el servicio, saldo y amigos aceptados para el wizard
export default async function NuevaReservaPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const { servicio } = await searchParams;

  if (!servicio) redirect("/catalogo");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: service }, { data: profile }, { data: comoUser }, { data: comoContact }] = await Promise.all([
    supabase.from("services").select("*").eq("id", servicio).eq("is_active", true).single(),
    supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
    // Amigos donde yo inicié la solicitud → la otra persona es contact_id
    supabase
      .from("trusted_contacts")
      .select("profiles!trusted_contacts_contact_id_fkey(full_name, email)")
      .eq("user_id", user.id)
      .eq("status", "accepted"),
    // Amigos donde me enviaron la solicitud → la otra persona es user_id
    supabase
      .from("trusted_contacts")
      .select("profiles!trusted_contacts_user_id_fkey(full_name, email)")
      .eq("contact_id", user.id)
      .eq("status", "accepted"),
  ]);

  if (!service) notFound();

  const amigos = [
    ...(comoUser ?? []).map((a: any) => ({
      full_name: a.profiles?.full_name ?? null,
      email: a.profiles?.email ?? "",
    })),
    ...(comoContact ?? []).map((a: any) => ({
      full_name: a.profiles?.full_name ?? null,
      email: a.profiles?.email ?? "",
    })),
  ].filter((a) => a.email);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nueva reserva</h1>
      <ReservaWizard
        service={service}
        walletBalance={Number(profile?.wallet_balance ?? 0)}
        amigos={amigos}
      />
    </div>
  );
}

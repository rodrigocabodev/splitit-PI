import { createClient } from "@/lib/supabase/server";
import AdminReservasClient from "./admin-reservas-client";

// Vista global de todas las reservas — permite cancelar y eliminar
export default async function AdminReservasPage() {
  const supabase = await createClient();

  const { data: reservas } = await supabase
    .from("bookings")
    .select("*, services(title), profiles!bookings_organizer_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todas las reservas</h1>
        <span className="text-sm text-gray-400">{reservas?.length ?? 0} reservas</span>
      </div>

      <AdminReservasClient reservas={reservas ?? []} />
    </div>
  );
}

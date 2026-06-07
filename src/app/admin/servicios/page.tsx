import { createClient } from "@/lib/supabase/server";
import AdminServiciosClient from "./admin-servicios-client";

export default async function AdminServiciosPage() {
  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("services")
    .select("*")
    .order("id");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Gestión de servicios</h1>
      <AdminServiciosClient servicios={servicios ?? []} />
    </div>
  );
}

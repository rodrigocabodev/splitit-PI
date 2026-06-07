import { createClient } from "@/lib/supabase/server";
import AdminUsuariosClient from "./admin-usuarios-client";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_admin, wallet_balance, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
      <AdminUsuariosClient usuarios={usuarios ?? []} miId={user?.id ?? ""} />
    </div>
  );
}

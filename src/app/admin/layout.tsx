import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Layout del panel de administración
// Verifica que el usuario sea admin antes de renderizar cualquier página
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b bg-black text-white">
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold">SplitIt · Admin</span>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/servicios" className="hover:text-gray-300">Servicios</Link>
            <Link href="/admin/reservas" className="hover:text-gray-300">Reservas</Link>
            <Link href="/admin/usuarios" className="hover:text-gray-300">Usuarios</Link>
            <Link href="/dashboard" className="hover:text-gray-300">← Volver</Link>
          </div>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

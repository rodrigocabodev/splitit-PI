import { createClient } from "@/lib/supabase/server";

// Verifica que la sesión actual sea de un administrador.
// Devuelve un mensaje de error si no, o null si todo OK.
// Pensado para usar al inicio de las server actions de /admin/*.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "No autenticado.";

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return "Acceso denegado.";
  return null;
}

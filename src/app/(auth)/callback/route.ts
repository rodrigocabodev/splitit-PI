import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Ruta de callback genérica para Supabase (confirmación de email, recuperación
// de contraseña, etc.). Intercambia el código temporal por una sesión y
// redirige al destino indicado en `next` (por defecto, el dashboard).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Solo permitimos redirecciones internas para evitar open redirects.
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}

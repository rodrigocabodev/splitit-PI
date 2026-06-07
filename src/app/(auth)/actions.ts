"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Inicia sesión con email y contraseña
export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

// Registra un nuevo usuario con nombre, email y contraseña
// Supabase crea el usuario en auth.users y el trigger crea su perfil en public.profiles
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
      },
    },
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}



// Cierra la sesión del usuario
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// Envía un email con un enlace para restablecer la contraseña.
// El enlace llega a /callback con type=recovery, intercambia el código por una
// sesión temporal y redirige a /recuperar/nueva para fijar la nueva contraseña.
export async function solicitarReset(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Introduce un email." };

  const h = await headers();
  const origin = h.get("origin") ?? `http://${h.get("host") ?? "localhost:3000"}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/callback?next=/recuperar/nueva`,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

// Actualiza la contraseña del usuario actualmente autenticado.
// Requiere una sesión activa (la que se crea al clicar el enlace del email).
export async function actualizarPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmar = formData.get("confirmar") as string;

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (password !== confirmar) {
    return { error: "Las contraseñas no coinciden." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

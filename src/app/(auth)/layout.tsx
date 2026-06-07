// Layout compartido para las páginas de login, registro y recuperación.
// Centra el formulario y aplica un fondo decorativo de marca.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 bg-brand-glow px-4 py-8">
      {children}
    </main>
  );
}

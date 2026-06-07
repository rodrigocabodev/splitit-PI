// Formateadores reutilizables a lo largo de la app.

const MONEY_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Formatea un número como cantidad en euros con dos decimales (es-ES).
// Valores nulos/indefinidos se tratan como 0.
export function formatMoney(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  return MONEY_FORMATTER.format(Number.isFinite(num) ? num : 0);
}

// Las reservas se guardan en UTC pero la app funciona en hora peninsular.
// Forzamos la zona horaria al formatear para que el resultado sea el mismo
// tanto si renderiza el servidor (Vercel, UTC) como el cliente.
const TZ = "Europe/Madrid";

export function formatHora(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatFecha(
  value: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("es-ES", { timeZone: TZ, ...opts });
}

// Genera hasta 2 iniciales para un avatar a partir del nombre completo;
// si no hay nombre, las saca de la parte local del email; si no hay nada, "?".
export function initialsFor(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "";
  if (!base) return "?";
  return (
    base
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

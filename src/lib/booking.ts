// Funciones de dominio para reservas: cálculo de horas, split de pago, etc.
// Lógica pura sin dependencias externas (fácil de testear).

// Suma horas enteras a una hora en formato "HH:MM" y devuelve "HH:MM".
// No contempla cambios de día (se usa para reservas dentro del horario diario).
export function sumarHoras(hhmm: string, horas: number): string {
  const [hh, mm] = hhmm.split(":").map(Number);
  const totalMin = hh * 60 + mm + horas * 60;
  const nh = Math.floor(totalMin / 60);
  const nm = totalMin % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// Devuelve true si la reserva propuesta cae fuera del horario del servicio.
export function estaFueraDeHorario(
  horaInicio: string,
  horaFin: string,
  opens: string,
  closes: string,
): boolean {
  return horaInicio < opens || horaFin > closes;
}

// Calcula el precio que paga cada persona dividiendo el total entre el número
// de participantes. Redondea a 2 decimales. Devuelve `total` si no hay personas.
export function calcularPrecioPorPersona(total: number, numPersonas: number): number {
  if (numPersonas <= 0) return total;
  return Number((total / numPersonas).toFixed(2));
}

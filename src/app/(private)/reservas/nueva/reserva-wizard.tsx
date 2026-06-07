"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Money } from "@/components/ui/money";
import { Calendar, Users, Receipt, Wallet, CreditCard, X, Check, AlertCircle } from "lucide-react";
import { crearReserva } from "./actions";
import { sumarHoras, estaFueraDeHorario, calcularPrecioPorPersona } from "@/lib/booking";
import type { Service } from "@/types";

type Amigo = { full_name: string | null; email: string };

const STEPS = [
  { n: 1, label: "Fecha y hora", icon: Calendar },
  { n: 2, label: "Participantes", icon: Users },
  { n: 3, label: "Confirmación", icon: Receipt },
];

export default function ReservaWizard({
  service,
  walletBalance,
  amigos,
}: {
  service: Service;
  walletBalance: number;
  amigos: Amigo[];
}) {
  const opens = service.opens_at?.slice(0, 5) ?? "09:00";
  const closes = service.closes_at?.slice(0, 5) ?? "21:00";

  const { fechaInicial, horaInicial } = computarHueco(opens, closes);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [fecha, setFecha] = useState(fechaInicial);
  const [horaInicio, setHoraInicio] = useState(horaInicial);
  const [numHoras, setNumHoras] = useState(1);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = service.price_per_hour * numHoras;
  const numPersonas = emails.length + 1;
  const porPersona = calcularPrecioPorPersona(totalPrice, numPersonas);

  const horaFin = sumarHoras(horaInicio, numHoras);
  const fueraDeHorario = estaFueraDeHorario(horaInicio, horaFin, opens, closes);

  function buildTimestamps() {
    const start = new Date(`${fecha}T${horaInicio}:00`);
    const end = new Date(start.getTime() + numHoras * 60 * 60 * 1000);
    return { start_time: start.toISOString(), end_time: end.toISOString() };
  }

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || emails.includes(trimmed)) return;
    setEmails([...emails, trimmed]);
    setEmailInput("");
  }

  function removeEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  function toggleAmigo(email: string) {
    if (emails.includes(email)) {
      setEmails(emails.filter((e) => e !== email));
    } else {
      setEmails([...emails, email]);
    }
  }

  async function confirmar(payment_method: "wallet" | "card") {
    setLoading(true);
    setError(null);
    const { start_time, end_time } = buildTimestamps();

    const result = await crearReserva({
      service_id: service.id,
      start_time,
      end_time,
      participant_emails: emails,
      payment_method,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 bg-card shadow-sm">
      {/* Indicador de paso */}
      <div className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = paso === s.n;
          const isDone = paso > s.n;
          return (
            <div key={s.n} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : isDone
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span className={`text-xs font-medium hidden sm:inline truncate ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 transition-colors ${isDone ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── PASO 1: Fecha y hora ── */}
      {paso === 1 && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-semibold">{service.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {service.price_per_hour} €/h · Horario: {opens} – {closes}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hora">Hora de inicio</Label>
              <Input
                id="hora"
                type="time"
                value={horaInicio}
                min={opens}
                max={closes}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="horas">Nº horas</Label>
              <Input
                id="horas"
                type="number"
                min={1}
                max={8}
                value={numHoras}
                onChange={(e) => setNumHoras(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Acaba a las <span className="font-medium text-foreground">{horaFin}</span> · Total
            </span>
            <Money value={totalPrice} className="text-xl" />
          </div>

          {fueraDeHorario && (
            <p className="text-xs text-destructive inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              La reserva se sale del horario del servicio ({opens} – {closes}).
            </p>
          )}

          <Button
            onClick={() => setPaso(2)}
            disabled={!fecha || numHoras < 1 || fueraDeHorario}
            size="lg"
          >
            Siguiente →
          </Button>
        </div>
      )}

      {/* ── PASO 2: Participantes ── */}
      {paso === 2 && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <p className="text-sm text-muted-foreground">
            Añade las personas que van a compartir el gasto.
            Tú pagas tu parte ahora; ellos recibirán una solicitud de pago.
          </p>

          {/* Amigos de confianza */}
          {amigos.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mis amigos</p>
              {amigos.map((a) => {
                const checked = emails.includes(a.email);
                return (
                  <label
                    key={a.email}
                    className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                      checked ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted/50 hover:border-muted-foreground/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmigo(a.email)}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.full_name ?? a.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Añadir por email */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Otro email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
            />
            <Button variant="outline" onClick={addEmail}>
              Añadir
            </Button>
          </div>

          {/* Emails añadidos manualmente */}
          {emails.filter((e) => !amigos.some((a) => a.email === e)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails
                .filter((e) => !amigos.some((a) => a.email === e))
                .map((email) => (
                  <span key={email} className="inline-flex items-center gap-1.5 bg-muted text-foreground rounded-full pl-3 pr-1 py-1 text-xs">
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="size-5 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                      aria-label={`Quitar ${email}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}

          {/* Resumen del split */}
          <div className="border rounded-xl p-4 flex flex-col gap-2 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <Money value={totalPrice} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Personas ({numPersonas})</span>
              <Money value={porPersona} tone="positive" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPaso(1)} className="flex-1" size="lg">
              ← Atrás
            </Button>
            <Button onClick={() => setPaso(3)} className="flex-1" size="lg">
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      {/* ── PASO 3: Resumen tipo "ticket" ── */}
      {paso === 3 && (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
          {/* Ticket */}
          <div className="relative rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-dashed">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen</span>
              <Receipt className="size-4 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <Row label="Servicio" value={service.title} />
              <Row label="Fecha" value={new Date(`${fecha}T00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} />
              <Row label="Horario" value={`${horaInicio} – ${horaFin} (${numHoras}h)`} />
              <Row label="Personas" value={`${numPersonas}`} />
            </div>

            <div className="border-t border-dashed pt-3 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total reserva</span>
                <Money value={totalPrice} />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold">Tu parte</span>
                <Money value={porPersona} tone="positive" className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Participantes invitados */}
          {emails.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Invitados ({emails.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {emails.map((e) => (
                  <span key={e} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> {error}
            </p>
          )}

          {/* Métodos de pago */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pagar tu parte (<Money value={porPersona} className="text-xs" />)
            </p>

            <button
              type="button"
              onClick={() => confirmar("wallet")}
              disabled={loading || walletBalance < porPersona}
              className="group flex items-center justify-between border rounded-xl px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
            >
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Wallet className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pagar con cartera</p>
                  <p className="text-xs text-muted-foreground">
                    Saldo: <Money value={walletBalance} tone={walletBalance >= porPersona ? "positive" : "negative"} className="text-xs" />
                  </p>
                </div>
              </div>
              {walletBalance < porPersona && (
                <span className="text-xs text-muted-foreground">Insuficiente</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => confirmar("card")}
              disabled={loading}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all bg-brand-gradient text-primary-foreground hover:scale-[1.01] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{loading ? "Procesando..." : "Pagar con tarjeta"}</p>
                  <p className="text-xs text-primary-foreground/80">Pago instantáneo</p>
                </div>
              </div>
            </button>
          </div>

          <Button variant="outline" onClick={() => setPaso(2)} disabled={loading} size="sm" className="self-start">
            ← Atrás
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

// Devuelve fecha+hora iniciales sugeridas para el wizard:
// - hora = próxima hora redonda dentro del horario del servicio
// - fecha = hoy si todavía queda hueco; mañana si ya pasó el cierre
function computarHueco(opens: string, closes: string): { fechaInicial: string; horaInicial: string } {
  const ahora = new Date();
  const proxima = new Date(ahora);
  proxima.setMinutes(0, 0, 0);
  proxima.setHours(proxima.getHours() + 1);

  const minHora = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const opensMin = minHora(opens);
  const closesMin = minHora(closes);
  const proximaMin = proxima.getHours() * 60 + proxima.getMinutes();

  let fecha = proxima;
  let hora = proximaMin;

  if (hora >= closesMin) {
    fecha = new Date(proxima);
    fecha.setDate(fecha.getDate() + 1);
    hora = opensMin;
  } else if (hora < opensMin) {
    hora = opensMin;
  }

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const hh = String(Math.floor(hora / 60)).padStart(2, "0");
  const min = String(hora % 60).padStart(2, "0");

  return { fechaInicial: `${yyyy}-${mm}-${dd}`, horaInicial: `${hh}:${min}` };
}

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Calendar, Users, Wallet, Zap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const PASOS = [
  {
    num: "1",
    icon: Calendar,
    titulo: "Elige un servicio",
    desc: "Explora el catálogo y reserva lo que necesitas: desde salas de reuniones hasta experiencias de ocio.",
  },
  {
    num: "2",
    icon: Users,
    titulo: "Añade a quién va",
    desc: "Invita a amigos por email. Si tienen auto-cobro activo, se les descuenta automáticamente.",
  },
  {
    num: "3",
    icon: Wallet,
    titulo: "Paga solo tu parte",
    desc: "Elige pagar con tu cartera SplitIt o con tarjeta. Cada uno paga lo que le toca, sin líos.",
  },
];

const VENTAJAS = [
  {
    icon: Zap,
    titulo: "Auto-cobro inteligente",
    desc: "Tus amigos de confianza pagan al instante, sin recordatorios ni mensajes.",
  },
  {
    icon: ShieldCheck,
    titulo: "Cancelación segura",
    desc: "Si cancelas una reserva, devolvemos automáticamente lo cobrado a cada participante.",
  },
  {
    icon: Sparkles,
    titulo: "Sin fricciones",
    desc: "Una sola URL, un solo flujo. Reserva, divide y olvídate del Excel.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col">

        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-glow">
          <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3 text-primary" />
              Reserva en grupo, sin deudas pendientes
            </span>

            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
                Reserva. Divide.{" "}
                <span className="text-brand-gradient">SplitIt.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                La forma más sencilla de reservar servicios entre varios y que cada uno
                pague solo lo que le toca. Sin mensajes, sin líos, sin Excel.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/registro" className={`${buttonVariants({ size: "lg" })} group`}>
                Empezar gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/catalogo" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Ver servicios
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-t bg-background px-4 py-20">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">¿Cómo funciona?</p>
              <h2 className="text-3xl font-bold tracking-tight">En tres pasos</h2>
              <p className="text-muted-foreground text-sm">
                Diseñado para que organizar planes con amigos deje de ser un trabajo.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {PASOS.map((paso, i) => {
                const Icon = paso.icon;
                return (
                  <div
                    key={paso.num}
                    className="relative flex flex-col gap-3 p-6 rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-3xl font-bold text-muted-foreground/40 tabular-nums">{paso.num}</span>
                    </div>
                    <h3 className="font-semibold text-base">{paso.titulo}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{paso.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Ventajas */}
        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Por qué SplitIt</p>
              <h2 className="text-3xl font-bold tracking-tight">Pensado para grupos reales</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {VENTAJAS.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.titulo} className="flex flex-col gap-3 p-6 rounded-2xl bg-background border">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-semibold">{v.titulo}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 py-20 border-t">
          <div className="max-w-3xl mx-auto rounded-3xl bg-brand-gradient text-primary-foreground p-10 sm:p-14 flex flex-col items-center text-center gap-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tu próximo plan, sin discutir la cuenta
            </h2>
            <p className="text-primary-foreground/80 max-w-lg">
              Crea tu cuenta y prueba SplitIt con un par de amigos en menos de un minuto.
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-background text-foreground font-semibold transition-all hover:scale-105"
            >
              Empezar ahora
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

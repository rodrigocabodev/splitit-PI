import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Star, ImageOff, Calendar, Euro, MessageSquare } from "lucide-react";
import { formatFecha } from "@/lib/format";

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: service }, { data: ratings, count: totalRatings }, { count: numReservas }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).eq("is_active", true).single(),
    supabase
      .from("ratings")
      .select("score, comment, created_at, profiles(full_name)", { count: "exact" })
      .eq("service_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("service_id", id)
      .neq("status", "cancelled"),
  ]);

  if (!service) notFound();

  const totalCount = totalRatings ?? 0;
  const conComentario = (ratings ?? []).filter((r: any) => r.comment?.trim());

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Volver */}
      <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-foreground transition w-fit inline-flex items-center gap-1.5">
        <ArrowLeft className="size-3.5" /> Catálogo
      </Link>

      {/* Imagen */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-muted ring-1 ring-border">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-10" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm shadow-sm">
          {service.category}
        </Badge>
      </div>

      {/* Cabecera */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">{service.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border rounded-xl divide-x bg-card overflow-hidden">
        <StatBlock icon={Euro} label="Precio/hora" value={`${service.price_per_hour} €`} />
        <StatBlock
          icon={Star}
          label="Valoración"
          value={totalCount > 0 ? service.rating : "—"}
          subtitle={totalCount > 0 ? `${totalCount} opinión${totalCount > 1 ? "es" : ""}` : "Sin valoraciones"}
          iconClass="fill-warning text-warning"
        />
        <StatBlock icon={Calendar} label="Reservas" value={numReservas ?? 0} />
      </div>

      {/* CTA */}
      <Link
        href={`/reservas/nueva?servicio=${service.id}`}
        className={`${buttonVariants({ size: "lg" })} w-full justify-center text-base`}
      >
        Reservar ahora
      </Link>

      {/* Reseñas */}
      {conComentario.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            Lo que dicen otros usuarios
          </h2>
          <div className="flex flex-col gap-3">
            {conComentario.map((r: any, i: number) => {
              const nombre = r.profiles?.full_name ?? "Usuario";
              const initials = nombre.split(" ").filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("") || "U";
              return (
                <div
                  key={i}
                  className="border rounded-xl p-4 flex flex-col gap-2 bg-card animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {initials}
                      </div>
                      <p className="text-sm font-medium">{nombre}</p>
                    </div>
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`size-3.5 ${idx < r.score ? "fill-warning text-warning" : "text-muted/40"}`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFecha(r.created_at, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  subtitle,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  iconClass?: string;
}) {
  return (
    <div className="p-4 text-center flex flex-col items-center gap-1">
      <Icon className={`size-4 text-muted-foreground ${iconClass ?? ""}`} />
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
